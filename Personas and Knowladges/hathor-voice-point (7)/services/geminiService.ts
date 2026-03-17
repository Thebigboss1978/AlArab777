
import { GoogleGenAI } from "@google/genai";

// CRITICAL FIX: Do not initialize at the top level. 
// This causes 500 Errors if the API Key isn't ready during the build.
let clientInstance: GoogleGenAI | null = null;

export const getAiClient = () => {
  if (!clientInstance) {
    // Fixed: Exclusively use process.env.API_KEY as per the library guidelines
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API Key missing in getAiClient");
      throw new Error("API Key not found");
    }
    clientInstance = new GoogleGenAI({ apiKey });
  }
  return clientInstance;
};

// Legacy text-only generation (kept for fallback)
export const generateAgentResponse = async (prompt: string): Promise<string> => {
  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access .text property directly
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System Error.";
  }
};
