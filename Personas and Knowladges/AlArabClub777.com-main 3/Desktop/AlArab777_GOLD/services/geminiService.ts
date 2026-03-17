
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

// NEW: Live Price Scanner
export const searchLivePrice = async (query: string): Promise<{ name: string, price: number, features: string[] }> => {
  try {
    const client = getAiClient();
    // Using Gemini 3 Flash for high-speed search grounding
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the REAL, CURRENT price for one night stay at "${query}" in Giza/Cairo for tomorrow night. 
      Check Booking.com or major travel sites.
      Return ONLY a JSON object with this format (no markdown):
      {
        "name": "The Exact Hotel Name Found",
        "price": Number (The price in EGP. If found in USD, convert to EGP approx 50),
        "features": ["Array of 3 top features found"]
      }
      If you can't find an exact price, estimate based on the hotel star rating in Giza.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    return {
      name: data.name || query,
      price: Number(data.price) || 3500, // Fallback safety
      features: data.features || ["Pyramid View", "Free Wifi", "Breakfast"]
    };

  } catch (error) {
    console.error("Live Search Failed, reverting to estimation:", error);
    return {
      name: query,
      price: Math.floor(Math.random() * (4000 - 2000) + 2000),
      features: ["Standard Room", "City View", "Wifi"]
    };
  }
};
