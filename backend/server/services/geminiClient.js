import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function generateRouteInfo({
  systemInstruction,
  userMessage
}) {
  if (!config.geminiApiKey) {
    const err = new Error(
      "GEMINI_API_KEY belum diatur di backend/.env."
    );

    err.status = 501;
    throw err;
  }

  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[Gemini] Request ${attempt + 1}/${maxRetries + 1}`
      );

      const response =
        await ai.models.generateContent({
          model: config.geminiModel,
          contents: userMessage,
          config: {
            systemInstruction,
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        });

      console.log("[Gemini] Request berhasil.");

      return response.text;
    } catch (error) {
      const status =
        error?.status ||
        error?.code ||
        error?.error?.code;

      const message =
        error?.message ||
        error?.error?.message ||
        "Unknown Gemini API error";

      console.error(
        `[Gemini] Error ${status}:`,
        message
      );

      const retryable =
        Number(status) === 429 ||
        Number(status) === 503;

      if (retryable && attempt < maxRetries) {
        const delay =
          2000 * Math.pow(2, attempt);

        console.log(
          `[Gemini] Retry dalam ${
            delay / 1000
          } detik...`
        );

        await sleep(delay);
        continue;
      }

      const err = new Error(
        `Gemini API Error (${status}): ${message}`
      );

      err.status = Number(status) || 500;

      throw err;
    }
  }

  throw new Error(
    "Gemini tidak dapat memproses permintaan."
  );
}