






const DEFAULT_CONFIG = {
    provider: 'openai',
    
    apiKey: window.OPENAI_API_KEY || window.VITE_OPENAI_API_KEY || '', 
    model: 'gpt-4o-realtime-preview-2024-12-17', 
    level: 'pro', 
    elevenlabsAgent: 'agent_1101k5jz8k53fne8rf3h290hwyyr',
};




const MODEL_DEFAULTS = {
    openai: 'gpt-4o-realtime-preview-2024-12-17',
    gemini: 'gemini-2.0-flash-exp',
    elevenlabs: 'conversational-ai',
    hume: 'evi-v2'
};


window.MODEL_DEFAULTS = MODEL_DEFAULTS;
window.config = { ...DEFAULT_CONFIG };
