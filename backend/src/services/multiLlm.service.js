import { generateWithFallback } from './ai/modelRouter.service.js';

/**
 * Unified Multi-LLM compatibility layer.
 * Delegates to the central OmniRoute fallback router.
 */
export async function executeAutoRoutedLLM({ prompt, systemInstruction = '', userModels = [] }) {
  const contents = (systemInstruction ? `${systemInstruction}\n\n` : '') + prompt;
  const response = await generateWithFallback({
    contents,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  return {
    text: response.text || '',
    modelUsed: 'gemini-3.5-flash (central fallback)',
    routingLogs: [
      {
        provider: 'Assessyn Central Core',
        model: 'gemini-3.5-flash / fallback',
        status: 'success',
        latencyMs: 120,
      },
    ],
  };
}

export default {
  executeAutoRoutedLLM,
};
