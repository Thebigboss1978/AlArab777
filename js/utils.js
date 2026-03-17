// ═══════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function playBase64Audio(base64Data, mimeType) {
    try {
        const raw = atob(base64Data);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

        // PCM data — play via AudioContext
        const playCtx = new AudioContext({ sampleRate: 24000 });
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

        const buffer = playCtx.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);
        const src = playCtx.createBufferSource();
        src.buffer = buffer;
        src.connect(playCtx.destination);
        src.start();
    } catch(e) {
        log(`Audio play error: ${e.message}`, 'warn');
    }
}

window.arrayBufferToBase64 = arrayBufferToBase64;
window.playBase64Audio = playBase64Audio;
