import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    '[GEMINI] Warning: GEMINI_API_KEY is missing from environment variables.'
  );
}

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export { gemini };
export default gemini;