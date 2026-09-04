import logger from '../config/logger.js';
import { buildQueryOptimizerPrompt } from '../prompts/index.js';
import { generateWithFallback } from './ai/modelRouter.service.js';

/**
 * Optimize a search query for vector search using Central AI Model Router
 *
 * @param {string} userQuery - Raw user query
 * @returns {Promise<string>} Optimized query
 */
export const optimizeQuery = async (userQuery) => {
  if (!userQuery || !userQuery.trim()) return '';

  const userPrompt = buildQueryOptimizerPrompt(userQuery);

  try {
    const response = await generateWithFallback({
      contents: userPrompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 256,
      },
    });

    const content = response.text?.trim();
    return content ? content.replace(/^["']|["']$/g, '') : userQuery;
  } catch (err) {
    logger.warn('[Optimizer Service Error]: ' + (err?.message || err));
    return userQuery;
  }
};

export default { optimizeQuery };
