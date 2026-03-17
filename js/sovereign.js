/**
 * 🔱 SOVEREIGN SYSTEM BRIDGE (General Logic)
 * Extracts identity and provides a unified interface for all components.
 * This makes the system "General" and not tied to index.html structure.
 */

window.SOVEREIGN = {
    identity: null,
    
    // Resolve Identity from any source (DOM or Storage)
    resolve: function() {
        const idDiv = document.getElementById('sovereign-id');
        const identityStr = idDiv ? idDiv.getAttribute('data-identity') : (localStorage.getItem('alarab777_sovereign_id') || "");
        
        if (!identityStr) return {};
        
        const parts = identityStr.split('|');
        const idObj = {};
        parts.forEach(part => {
            const [key, value] = part.split(':');
            if (key && value) idObj[key] = value;
        });
        
        this.identity = idObj;
        return idObj;
    },
    
    // Global Event Logger
    log: function(msg, level='info') {
        const ts = new Date().toLocaleTimeString();
        console.log(`[SOVEREIGN ${level.toUpperCase()}] ${ts}: ${msg}`);
        // Dispatch event for UI listeners (like Aquaman Shell)
        window.dispatchEvent(new CustomEvent('sovereign-log', { detail: { msg, level, ts } }));
    },
    
    // Self-Healing Protocol
    heal: function(provider, error) {
        this.log(`Critical Failure in ${provider}: ${error}`, 'error');
        this.log(`Still Healing... Pivoting to alternate tunnel.`, 'warn');
        // Trigger pivot logic in app.js
        if (window.pivotProvider) window.pivotProvider();
    }
};

// Auto-initialize
window.SOVEREIGN.resolve();
window.resolveSovereignIdentity = () => window.SOVEREIGN.resolve();
