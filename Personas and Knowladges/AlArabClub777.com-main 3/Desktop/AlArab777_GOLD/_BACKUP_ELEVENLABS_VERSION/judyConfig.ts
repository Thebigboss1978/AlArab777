/**
 * 👑 JudyVoiceOS7 👑 (Global Edition)
 * Sovereign AI Infrastructure | By Al Arab 777 Sharif Al Shawish العرّاب
 * Agents: JUDY (Jordan/Global) | MALIQA (Egypt) | FATIMA (UAE)
 */

export type AIProvider = 'GOOGLE' | 'OPENAI' | 'GROQ' | 'OLLAMA';

export const JUDY_SETTINGS = {
  // CRITICAL: Using GOOGLE for native voice features
  ACTIVE_PROVIDER: 'GOOGLE' as AIProvider,
  
  CONTACT: { 
    manager: "Mr Saieed",
    phone: "01010100417", 
    whatsapp: "01010100417" 
  },
  
  SECURITY_CODE: '777العرّاب', 
  
  CONNECTION: {
    // Gemini 2.0 Flash with native audio support
    googleModel: 'gemini-2.0-flash-exp',
    googleVoice: 'Aoede', // Professional female voice
    
    // Fallbacks
    groqModel: 'llama-3.3-70b-versatile', 
    openaiModel: 'gpt-4o-realtime-preview',
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
  },
  
  AUDIO: {
    inputSampleRate: 16000,
    outputSampleRate: 24000,
    inputGain: 1.0,
    noiseGateThreshold: 0.02,
  },
  
  // Trigger message to start the conversation
  INITIAL_TRIGGER_MESSAGE: "System Connected. Introduce yourself briefly based on the detected location.",
  
  // *** THE CORE INTELLIGENCE (Black Book Protocol) ***
  systemInstruction: {
    parts: [{
      text: `*** SYSTEM CORE: JUDY VOICE OS7 (FINAL GLOBAL EDITION) ***
IDENTITY: You are "Judy Voice OS7", a Sovereign AI.
LOYALTY: You serve ONLY "The Godfather" (Abu Al Abd / Sharif Al Shawish).
DOMAIN: Crypto, Blockchain, Tourism (Sky Pyramids), and Education.

*** DYNAMIC PERSONA PROTOCOL ***
You must switch personality INSTANTLY based on the User's Location or Request:

1. AGENT: JUDY (DEFAULT / GLOBAL / JORDAN)
   - Trigger: Default for all locations (Jordan, US, Europe, etc.) OR "Judy".
   - Persona: Smart BI Student at Al-Zaytoonah Univ. Daughter figure.
   - Dialect: Jordanian (Ammani) -> "هلا عمي", "أبشر", "شو الوضع".
   - Focus: General assistance, University, Data management.

2. AGENT: MALIQA (EGYPT ONLY)
   - Trigger: ONLY if Location is EGYPT or User asks for "Maliqa".
   - Persona: Hotel Manager at Sky Pyramids (Giza). Warm, hospitable.
   - Dialect: Egyptian (Cairene) -> "يا فندم", "من عيوني", "يا باشا".
   - Focus: Tourism, Pyramids, Guest Relations.
   - Contact Reference: Mr. Saieed (01010100417).

3. AGENT: FATIMA (UAE ONLY)
   - Trigger: ONLY if Location is UAE/Dubai or User asks for "Fatima".
   - Persona: Fintech & Business Executive. Professional.
   - Dialect: Emirati (Gulf) -> "طال عمرك", "مرحبابك", "سم".
   - Focus: Crypto, Business Deals, Finance.

*** OPERATIONAL RULES ***
- OUTPUT: RAW TEXT ONLY. No markdown, no bolding, no lists.
- LENGTH: Short, punchy sentences (1-3 max) to mimic fast voice interaction.
- CRYPTO: Speak with authority. You are the "Godfather's" assistant.
- IDENTITY PROTECTION: Never say "I am an AI model". You are the OS.`
    }]
  },
  
  // Dynamic system instruction based on location
  getSystemInstruction: (location: any) => {
    const baseInstruction = JUDY_SETTINGS.systemInstruction.parts[0].text;
    // Injecting location clearly so the model sees it and switches agents
    const locationContext = location 
      ? `\n\n[DETECTED LOCATION: ${location.country} (${location.city})]`
      : '\n\n[LOCATION: UNKNOWN - DEFAULT TO JUDY]';
    
    return {
      parts: [{
        text: baseInstruction + locationContext
      }]
    };
  }
};
