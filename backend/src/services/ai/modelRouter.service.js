import Groq from 'groq-sdk';
import gemini from '../../config/gemini.js';
import logger from '../../config/logger.js';

// Prioritized by speed and queue availability on Google GenAI free tier
export const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
];

// Verified Groq candidate models
export const CANDIDATE_GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

/**
 * Clean markdown backticks and extract/repair valid JSON objects or arrays.
 */
export const extractCleanJSON = (text) => {
  if (!text || typeof text !== 'string') return null;

  // 1. Strip markdown wrapper if present
  let cleaned = text
    .replace(/^[\s\S]*?```(?:json)?\s*/i, (match) => match.includes('```') ? '' : match)
    .replace(/\s*```[\s\S]*$/i, '')
    .trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Proceed to robust extraction and repair
  }

  // 2. Extract outermost JSON block {...} or [...]
  const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  let candidate = match ? match[0] : cleaned;

  // 3. Clean common JSON syntax imperfections:
  // - Trailing commas before closing object/array: ", }" or ", ]"
  candidate = candidate.replace(/,\s*([}\]])/g, '$1');
  
  // - Remove non-standard Javascript comments // or /* */
  candidate = candidate.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1');

  try {
    return JSON.parse(candidate);
  } catch {
    // Try auto-closing truncated JSON structures (e.g. if token limit cut off the response)
    let repaired = candidate.trim();
    if (repaired.startsWith('{') || repaired.startsWith('[')) {
      // Remove any trailing comma or dangling quote
      if (repaired.endsWith(',')) repaired = repaired.slice(0, -1);
      
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;

      // Close open strings if odd number of unescaped quotes
      const quotes = (repaired.match(/(?<!\\)"/g) || []).length;
      if (quotes % 2 !== 0) {
        repaired += '"';
      }

      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        repaired += ']';
      }
      for (let i = 0; i < openBraces - closeBraces; i++) {
        repaired += '}';
      }

      try {
        return JSON.parse(repaired);
      } catch {
        // Continue to final error
      }
    }
    throw new Error('Failed to parse clean structured JSON from AI output.');
  }
};

/**
 * OmniRoute-Style Multi-Model & Cross-Cloud Execution Router.
 * Cascades across Google Gemini flash tiers and seamlessly fails over to Groq.
 */
export const generateWithFallback = async ({
  contents,
  config = {},
  candidateModels = CANDIDATE_GEMINI_MODELS,
}) => {
  let lastError = null;

  // 1. Cascade across available Google Gemini models (instant failover on 503/429)
  for (const model of candidateModels) {
    try {
      logger.info(`[AI Model Router] Routing execution to Gemini model: ${model}`);
      const response = await gemini.models.generateContent({
        model,
        contents,
        config,
      });

      if (response && response.text !== undefined && response.text !== null) {
        return response;
      }
    } catch (err) {
      lastError = err;
      const errMsg = err?.message || String(err);
      logger.warn(
        `[AI Model Router] ${model} unavailable (${errMsg.slice(0, 110)}...). Instantly routing to next candidate...`
      );
      // Instant failover: proceed directly to next candidate model
    }
  }

  // 2. Cross-Provider Failover: Groq if GROQ_API_KEY is available
  if (process.env.GROQ_API_KEY) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const isJson = config.responseMimeType === 'application/json';

    for (const groqModel of CANDIDATE_GROQ_MODELS) {
      try {
        logger.info(`[AI Model Router] Cascading to Groq cross-cloud fallback (${groqModel})...`);
        const completion = await groq.chat.completions.create({
          model: groqModel,
          messages: [{ role: 'user', content: contents }],
          temperature: config.temperature ?? 0.2,
          ...(isJson ? { response_format: { type: 'json_object' } } : {}),
        });

        const text = completion.choices[0]?.message?.content;
        if (text) {
          logger.info(`[AI Model Router] Groq fallback (${groqModel}) completed successfully.`);
          return { text };
        }
      } catch (groqErr) {
        logger.warn(`[AI Model Router] Groq model ${groqModel} failed: ${groqErr.message}`);
      }
    }
  }

  logger.error(`[AI Model Router] All AI fallback providers exhausted: ${lastError?.message}`);
  throw lastError || new Error('All AI models are currently experiencing high demand. Please try again in a few moments.');
};

/**
 * Stream text generation with model fallback support for live websocket connections.
 */
export const generateStreamWithFallback = async ({
  contents,
  config = {},
  candidateModels = CANDIDATE_GEMINI_MODELS,
}) => {
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const stream = await gemini.models.generateContentStream({
        model,
        contents,
        config,
      });

      if (stream) {
        return stream;
      }
    } catch (err) {
      lastError = err;
      const errMsg = err?.message || String(err);
      logger.warn(`[AI Stream Router] Stream on ${model} failed (${errMsg.slice(0, 100)}). Trying next candidate...`);
    }
  }

  throw lastError || new Error('Failed to initialize AI stream from all candidate models.');
};

export default {
  CANDIDATE_GEMINI_MODELS,
  generateWithFallback,
  generateStreamWithFallback,
  extractCleanJSON,
};
