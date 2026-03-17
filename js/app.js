// ═══════════════════════════════════════════════════════════
// AlArab 777 Voice Interface — Main Application Orchestrator
// ═══════════════════════════════════════════════════════════

const STATE = {
    IDLE: 'IDLE',
    CONNECTING: 'CONNECTING',
    LISTENING: 'LISTENING',
    THINKING: 'THINKING',
    SPEAKING: 'SPEAKING',
    ERROR: 'ERROR'
};

let currentState = STATE.IDLE;
let isSessionActive = false;
let peerConnection = null;
let audioElement = null;
let dataChannel = null;
let mediaStream = null;
let geminiWs = null;
let audioContext = null;
let audioWorklet = null;
let elevenLabsWs = null;
let humeWs = null;

// ─── DOM ───
const btnEl = document.getElementById('voice-btn');
const stateEl = document.getElementById('status-state');
const detailEl = document.getElementById('status-detail');
const badgeEl = document.getElementById('provider-badge');
const logEl = document.getElementById('log-content');

// ═══════════════════════════════════════════
// Config Load / Save & UI
// ═══════════════════════════════════════════
function loadConfig() {
    let cfg = { ...DEFAULT_CONFIG };
    const identity = window.resolveSovereignIdentity ? window.resolveSovereignIdentity() : {};
    
    try {
        const p = localStorage.getItem('alarab777_voice_provider');
        const l = localStorage.getItem('alarab777_intelligence_level');
        
        if (p) cfg.provider = p;
        if (l) cfg.level = l;

        // Pure Identity-Driven Persona Selection
        // The identity string in index.html should now include PERSONA:malika or PERSONA:judy
        let personaId = identity.PERSONA || 'malika'; 
        cfg.persona = window.PERSONAS ? window.PERSONAS[personaId] : null;

        // Open Model Resolution (Ka'b al-Daftar)
        // We do not restrict to a list. We take what the pipe gives us.
        cfg.model = localStorage.getItem('alarab777_custom_model') || window.MODEL_DEFAULTS[cfg.provider] || cfg.model;

        // Fetch API Key from environment based on selected provider
        const envKeyName = `${cfg.provider.toUpperCase()}_API_KEY`;
        // Open Key Resolution (Ka'b al-Daftar)
        // Check localStorage first (from Admin Panel), then Environment
        const envKey = window[envKeyName] || window[`VITE_${envKeyName}`] || '';
        cfg.apiKey = localStorage.getItem(`alarab777_custom_key_${cfg.provider}`) || envKey || cfg.apiKey;
        
        // ElevenLabs Agent ID persistence
        cfg.elevenlabsAgent = localStorage.getItem('alarab777_11labs_agent') || cfg.elevenlabsAgent;
    } catch(e) {}
    
    if (cfg.persona) {
        cfg.systemPrompt = window.buildSystemPrompt ? window.buildSystemPrompt() : cfg.persona.instructions;
    }
    return cfg;
}

function saveSettings() {
    config.provider = document.getElementById('cfg-provider').value;
    config.level = document.getElementById('cfg-model').value;

    localStorage.setItem('alarab777_voice_provider', config.provider);
    localStorage.setItem('alarab777_intelligence_level', config.level);
    localStorage.setItem('alarab777_custom_model', document.getElementById('cfg-custom-model').value.trim());
    localStorage.setItem(`alarab777_custom_key_${config.provider}`, document.getElementById('cfg-custom-key').value.trim());
    localStorage.setItem('alarab777_11labs_agent', document.getElementById('cfg-11labs-agent').value.trim());
    
    // Reboot with new resolved settings
    config = loadConfig();

    closeAdminPanel();
    updateBadge();
    log(`System Rebooted | Provider: ${config.provider} | Level: ${config.level}`, 'ok');
    setState(STATE.IDLE, 'Configuration saved — double-click to start');
}

function populateSettingsUI() {
    document.getElementById('cfg-provider').value = config.provider || 'openai';
    document.getElementById('cfg-model').value = config.level || 'pro';
    document.getElementById('cfg-custom-model').value = localStorage.getItem('alarab777_custom_model') || '';
    document.getElementById('cfg-custom-key').value = localStorage.getItem(`alarab777_custom_key_${config.provider}`) || '';
    document.getElementById('cfg-11labs-agent').value = localStorage.getItem('alarab777_11labs_agent') || config.elevenlabsAgent || '';
    
    // Toggle ElevenLabs field
    document.getElementById('grp-11labs-agent').style.display = (config.provider === 'elevenlabs') ? 'block' : 'none';
}

// Add event listener for provider change in UI
document.getElementById('cfg-provider').addEventListener('change', (e) => {
    document.getElementById('grp-11labs-agent').style.display = (e.target.value === 'elevenlabs') ? 'block' : 'none';
    // Clear key field when provider changes to show correct saved value
    document.getElementById('cfg-custom-key').value = localStorage.getItem(`alarab777_custom_key_${e.target.value}`) || '';
});

function openAdminPanel() {
    document.getElementById('admin-panel').classList.add('open');
    document.getElementById('overlay').classList.add('show');
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-settings').style.display = 'none';
    document.getElementById('admin-pwd').value = '';
    document.getElementById('admin-error').textContent = '';
    document.getElementById('admin-pwd').focus();
}

function closeAdminPanel() {
    document.getElementById('admin-panel').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}

function unlockAdmin() {
    const pwd = document.getElementById('admin-pwd').value.trim();
    if (pwd === '777') {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-settings').style.display = 'flex';
        populateSettingsUI();
    } else {
        document.getElementById('admin-error').textContent = 'Incorrect Password';
    }
}

// Event Listeners for Admin UI
document.getElementById('admin-dot').onclick = openAdminPanel;
document.getElementById('admin-unlock').onclick = unlockAdmin;
document.getElementById('save-settings').onclick = saveSettings;
document.getElementById('admin-pwd').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') unlockAdmin();
});

// ═══════════════════════════════════════════
// State Machine
// ═══════════════════════════════════════════
function setState(state, detail) {
    currentState = state;
    const labels = {
        [STATE.IDLE]: 'READY',
        [STATE.CONNECTING]: 'CONNECTING...',
        [STATE.LISTENING]: '● LISTENING',
        [STATE.THINKING]: '⟳ THINKING...',
        [STATE.SPEAKING]: '◉ SPEAKING',
        [STATE.ERROR]: '✕ ERROR'
    };
    stateEl.textContent = labels[state] || state;
    stateEl.className = 'state-' + state.toLowerCase();
    if (detail) detailEl.textContent = detail;

    // Button classes
    btnEl.className = '';
    if (state === STATE.LISTENING || state === STATE.THINKING) btnEl.classList.add('active');
    if (state === STATE.SPEAKING) { btnEl.classList.add('active', 'speaking'); }
    if (state === STATE.ERROR) btnEl.classList.add('error');
}

function updateBadge() {
    const names = { openai: 'OpenAI Realtime', gemini: 'Google Gemini', elevenlabs: 'ElevenLabs', hume: 'Hume EVI', custom: 'Custom API' };
    badgeEl.textContent = names[config.provider] || config.provider;
    if (config.provider === 'custom' && config.customName) {
        badgeEl.textContent = config.customName;
    }
}

// ═══════════════════════════════════════════
// Logging
// ═══════════════════════════════════════════
function log(msg, level = 'info') {
    const ts = new Date().toLocaleTimeString();
    const cls = level === 'error' ? 'log-error' : level === 'warn' ? 'log-warn' : level === 'ok' ? 'log-ok' : '';
    logEl.innerHTML += `<span class="${cls}">[${ts}] ${msg}</span>\n`;
    logEl.scrollTop = logEl.scrollHeight;
    
    // Bridge to Global Sovereign Logger
    if (window.SOVEREIGN) window.SOVEREIGN.log(msg, level);
}

function toggleLog() {
    document.getElementById('log-panel').classList.toggle('open');
}

document.getElementById('log-toggle').onclick = toggleLog;

// ═══════════════════════════════════════════
// Main Toggle (Double-Click)
// ═══════════════════════════════════════════
async function toggleVoice() {
    if (isSessionActive) {
        stopSession();
    } else {
        await startSession();
    }
}

document.getElementById('voice-btn').ondblclick = toggleVoice;

async function startSession() {
    const provider = config.provider;
    try {
        log(`Active Engine: ${provider} | Model: ${config.model}`);
        if (provider === 'elevenlabs') {
            log(`ElevenLabs Agent Active: ${config.elevenlabsAgent}`);
        }
        
        switch (provider) {
            case 'openai': await startOpenAI(); break;
            case 'gemini': await startGemini(); break;
            case 'elevenlabs': await startElevenLabs(); break;
            case 'hume': await startHume(); break;
            case 'custom':
                setState(STATE.ERROR, `Custom Provider (${config.customName}) logic must be implemented in js/providers/custom.js`);
                log(`Custom provider selected but no generic handler exists yet.`, 'warn');
                isSessionActive = false;
                break;
        }
    } catch (err) {
        log(`Connection error with ${provider}: ${err.message}`, 'error');
        
        // Still Healing Logic: Auto-pivot on failure
        const providers = ['openai', 'gemini', 'elevenlabs', 'hume'];
        const currentIndex = providers.indexOf(provider);
        const nextProvider = providers[(currentIndex + 1) % providers.length];
        
        log(`Still Healing... Pivoting from ${provider} to ${nextProvider}`, 'warn');
        config.provider = nextProvider;
        updateBadge();
        await startSession(); 
    }
}

// Global Pivot Helper
window.pivotProvider = () => {
    const providers = ['openai', 'gemini', 'elevenlabs', 'hume'];
    const nextProvider = providers[(providers.indexOf(config.provider) + 1) % providers.length];
    config.provider = nextProvider;
    updateBadge();
    startSession();
};

function stopSession() {
    log('Stopping session...');
    isSessionActive = false;

    // Clean up all possible connections
    if (peerConnection) { peerConnection.close(); peerConnection = null; }
    if (dataChannel) { dataChannel = null; }
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
    if (audioElement) { audioElement.pause(); audioElement.srcObject = null; audioElement = null; }
    if (geminiWs) { geminiWs.close(); geminiWs = null; }
    if (elevenLabsWs) { elevenLabsWs.close(); elevenLabsWs = null; }
    if (humeWs) { humeWs.close(); humeWs = null; }
    if (audioContext) { audioContext.close().catch(()=>{}); audioContext = null; }

    setState(STATE.IDLE, 'Session ended — double-click to start again');
    log('Session stopped', 'ok');
}

// Ensure globally available for DOM event handlers
window.toggleSettings = openAdminPanel; // Alias for any existing old calls
window.saveSettings = saveSettings;
window.toggleVoice = toggleVoice;
window.toggleLog = toggleLog;
window.log = log;
window.setState = setState;
window.stopSession = stopSession;
window.STATE = STATE;

// Initialize config override if previously saved
config = loadConfig();

// ═══════════════════════════════════════════
// Init
// ═══════════════════════════════════════════
window.onload = () => {
    const identity = window.resolveSovereignIdentity ? window.resolveSovereignIdentity() : {};
    
    // Update UI dynamically based on identity/persona
    if (identity.BRAND) {
        document.title = `Sovereign OS | ${identity.BRAND}`;
        const desc = document.getElementById('meta-desc');
        if (desc) desc.content = `AlArab 777 Sovereign Voice Interface - ${identity.BRAND}. Branch: ${identity.LOC || 'Global'}`;
    }

    // Dynamic Title & Subtitle in the Orb UI
    const uiTitle = document.getElementById('ui-title');
    const uiSub = document.getElementById('ui-subtitle');
    if (config.persona) {
        if (uiTitle) uiTitle.textContent = config.persona.name;
        if (uiSub) uiSub.textContent = config.persona.role;
    }

    updateBadge();
    log('Voice interface ready');
    if (config.persona) {
        log(`Active Persona: ${config.persona.name} (${config.persona.role})`);
    }
    log(`Active provider: ${config.provider}`);
};
