import { chunkResumeAndJD } from './chunking.service.js';
import { normalizeChunks } from '../utils/normalizer.js';

export const buildSemanticChunks = (resumeText, jdText) => {
  const raw = chunkResumeAndJD(resumeText || '', jdText || '');
  return normalizeChunks(raw);
};

const SECTION_BOOST = {
  skills:                 1.35,
  required_skills:        1.30,
  experience:             1.25,
  responsibility:         1.25,
  requirements:           1.20,
  project:                1.15,
  experience_requirement: 1.15,
  preferred_skills:       1.10,
  summary:                1.00,
  education:              0.95,
  general:                0.90,
  overview:               0.90,
};

/**
 * Fast, in-memory semantic context extraction (Zero OpenAI overhead, < 10ms)
 */
export const extractContextViaRAG = async (resumeText, jobDescription) => {
  try {
    const chunks = buildSemanticChunks(resumeText, jobDescription);

    if (!chunks || chunks.length === 0) {
      return `Job Description:\n${(jobDescription || '').slice(0, 3000)}\n\nCandidate Resume:\n${(resumeText || '').slice(0, 3000)}`;
    }

    // Rank and prioritize high-signal sections (Skills, Projects, Requirements, Experience)
    const ranked = chunks
      .map((chunk) => {
        const section = chunk.metadata?.section || 'general';
        const boost = SECTION_BOOST[section] || 1.0;
        return { chunk, score: boost * (chunk.content.length > 30 ? 1.1 : 0.8) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const formattedContext = ranked
      .map(({ chunk }) => {
        const type = chunk.metadata?.type ? chunk.metadata.type.toUpperCase() : 'CONTEXT';
        const section = chunk.metadata?.section ? chunk.metadata.section.toUpperCase() : 'GENERAL';
        return `[${type} > ${section}]\n${chunk.content}`;
      })
      .join('\n\n---\n\n');

    return formattedContext;
  } catch (err) {
    console.warn('[RAG] Fallback to raw text context:', err.message);
    return `Job Description:\n${(jobDescription || '').slice(0, 3000)}\n\nCandidate Resume:\n${(resumeText || '').slice(0, 3000)}`;
  }
};

export const retrieveContextForTopic = async (vectorStore, topic) => {
  if (!topic) return '';
  return `Target Topic: ${topic}`;
};

export default {
  extractContextViaRAG,
  buildSemanticChunks,
  retrieveContextForTopic,
};
