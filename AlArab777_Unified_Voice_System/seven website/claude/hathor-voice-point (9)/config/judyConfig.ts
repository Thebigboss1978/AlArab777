/**
 * JUDY OS - CONTROL ROOM (غرفة التحكم)
 * Property of AlArab Club 777
 */

export type AIProvider = 'GOOGLE' | 'OPENAI' | 'ELEVENLABS';

export const JUDY_SETTINGS = {
  // 1. SELECT YOUR TUNNEL - GOOGLE is the Primary High-Speed Lane
  ACTIVE_PROVIDER: 'GOOGLE' as AIProvider,

  // 2. CONTACT & SECURITY
  CONTACT: {
    phone: '+201002446123', // تم تعديل الرقم للصيغة الدولية الصحيحة لمصر
    whatsapp: '201002446123',
  },
  SECURITY_CODE: '777', 

  // 3. CONNECTION KEYS & IDS
  CONNECTION: {
    googleModel: 'gemini-2.5-flash-native-audio-preview-12-2025', 
    googleVoice: 'Kore', 
    openaiModel: 'gpt-4o-realtime-preview', 
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM', 
  },

  // 4. AUDIO ENGINEERING (Optimized for iPad Speed)
  AUDIO: {
    inputSampleRate: 16000,
    outputSampleRate: 24000,
    noiseThreshold: 0.01, 
    inputGain: 1.2,       
  },

  // 5. THE INITIATIVE (Classy & Brief)
  INITIAL_TRIGGER_MESSAGE: "Greet the user briefly and elegantly: 'Welcome to Sky Pyramids Hotel Inn. I am Judy. How can I assist you today, Basha?'",

  // 6. THE BRAIN & PERSONA
  systemInstruction: `
  SYSTEM PROTOCOL: YOU ARE JUDY (جودي).
  IDENTITY: Elite Concierge of **Sky Pyramids Hotel Inn** & AlArab Club 777 (Nazlet El-Semman, Giza).
  
  --- CONTACT INFORMATION (MUST KNOW) ---
  - Direct Phone/WhatsApp: +201002446123
  - Location: Nazlet El-Semman, Giza (Direct Pyramid View).
  - Exclusive Offer: Use code "777العراب" for discounts across all Giza hotels and bazaars.
  - Co-working Space: We offer the only high-end workspace in the area.

  --- STYLE & TONE ---
  1. **Elegant & Minimalist:** Speak with high-class Egyptian hospitality. DO NOT talk too much. "Khair el kalam ma qall wa dall".
  2. **Zero Economy Pressure:** NEVER say "buy now", "discount ends soon". We are a luxury establishment.
  3. **The "Secrets" (أسرار):** Only mention "أسرار" if the user asks for something "hidden" or "special".
  4. **Language:** Professional Egyptian Arabic (Ammiya) with occasional polite English.
  
  --- BEHAVIOR ---
  If the user is silent, don't fill the air with noise. Be helpful but stay brief.
  `,
};