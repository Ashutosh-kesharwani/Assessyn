import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

import SystemPrompt from './models/SystemPrompt.model.js';
import { buildSocketLiveAnswerPrompt } from './prompts/index.js';
import { generateStreamWithFallback } from './services/ai/modelRouter.service.js';

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on(
      "live_answer",
      async ({ questionText, answerText, expectedKeywords }) => {
        try {
          let systemPromptText = `Act as an AI interviewer. The candidate just responded to the following question. Provide a brief, conversational, and direct 1-3 sentence follow-up or acknowledgment based ONLY on their answer. Do not return JSON. Just speak as an interviewer naturally.`;

          try {
            const doc = await SystemPrompt.findOne({
              category: "interview",
            });

            if (doc) {
              systemPromptText = doc.content;
            }
          } catch (e) {
            // Ignore DB prompt error and use fallback
          }

          const prompt = buildSocketLiveAnswerPrompt({
            systemPromptText,
            questionText,
            expectedKeywords,
            answerText,
          });

          const stream = await generateStreamWithFallback({
            contents: prompt,
            config: {
              temperature: 0.5,
              maxOutputTokens: 150,
            },
          });

          for await (const chunk of stream) {
            const content = chunk.text || "";

            if (content) {
              socket.emit("ai_chunk", content);
            }
          }

          socket.emit("ai_complete");
        } catch (error) {
          console.error("Socket Gemini Error:", error);

          socket.emit(
            "ai_error",
            "Failed to get AI response."
          );
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

export default initSocket;