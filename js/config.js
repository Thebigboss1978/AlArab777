// ═══════════════════════════════════════════
// Config & Settings
// ═══════════════════════════════════════════

// ⚠️ ZERO HARDCODED KEYS ⚠️
// Keys are now injected via the Admin Panel (localStorage) to avoid exposing them in the DOM.

const DEFAULT_CONFIG = {
    provider: 'openai',
    // 🌍 API Keys are now sourced from Vercel/GitHub Env via window.ENV or direct fallbacks
    apiKey: window.OPENAI_API_KEY || window.VITE_OPENAI_API_KEY || '', 
    model: 'gpt-4o-realtime-preview-2024-12-17', 
    level: 'pro', // pro | flash | creative
    elevenlabsAgent: 'agent_1101k5jz8k53fne8rf3h290hwyyr',
};

// Model Resolution Logic
const MODELS = {
    openai: {
        pro: 'gpt-4o-realtime-preview-2024-12-17',
        flash: 'gpt-4o-mini-realtime-preview',
        creative: 'gpt-4o-realtime-preview'
    },
    gemini: {
        pro: 'gemini-2.0-flash-exp',
        flash: 'gemini-2.0-flash-exp',
        creative: 'gemini-2.0-flash-exp'
    },
    elevenlabs: {
        pro: 'conversational-ai',
        flash: 'conversational-ai',
        creative: 'conversational-ai'
    },
    hume: {
        pro: 'evi-v2',
        flash: 'evi-v2',
        creative: 'evi-v2'
    }
};

// Expose globally
window.DEFAULT_CONFIG = DEFAULT_CONFIG;
window.config = { ...DEFAULT_CONFIG };
