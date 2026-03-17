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

// Open Model Defaults (Spine)
// These are not "Restrictions", they are just starting points.
// You can override these via localStorage ('alarab777_custom_model') at any time.
const MODEL_DEFAULTS = {
    openai: 'gpt-4o-realtime-preview-2024-12-17',
    gemini: 'gemini-2.0-flash-exp',
    elevenlabs: 'conversational-ai',
    hume: 'evi-v2'
};

// Expose globally
window.MODEL_DEFAULTS = MODEL_DEFAULTS;
window.config = { ...DEFAULT_CONFIG };
