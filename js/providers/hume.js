// ═══════════════════════════════════════════
// 4. Hume EVI (WebSocket)
// ═══════════════════════════════════════════
async function startHume() {
    log('Hume: Starting EVI session...');

    const wsUrl = `wss://api.hume.ai/v0/evi/chat?api_key=${config.apiKey}`;
    humeWs = new WebSocket(wsUrl);

    humeWs.onopen = async () => {
        log('Hume: WebSocket connected', 'ok');
        isSessionActive = true;
        setState(STATE.LISTENING, 'Connected — speak now');

        // Start mic streaming
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
        audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(mediaStream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
            if (!isSessionActive || !humeWs || humeWs.readyState !== 1) return;
            const pcmData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
                int16[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
            }
            const base64 = arrayBufferToBase64(int16.buffer);
            humeWs.send(JSON.stringify({
                type: 'audio_input',
                data: base64
            }));
        };
    };

    humeWs.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'audio_output') {
                setState(STATE.SPEAKING, 'Responding...');
                if (data.data) {
                    playBase64Audio(data.data, 'audio/pcm;rate=24000');
                }
            } else if (data.type === 'user_message') {
                setState(STATE.THINKING, 'Processing...');
            } else if (data.type === 'assistant_end') {
                setState(STATE.LISTENING, 'Listening...');
            } else if (data.type === 'error') {
                setState(STATE.ERROR, `Hume error: ${data.message || 'Unknown'}`);
                log(`Hume error: ${data.message}`, 'error');
            }
        } catch(e) {}
    };

    humeWs.onerror = () => {
        setState(STATE.ERROR, 'Hume connection error — verify your API key');
        log('Hume: WebSocket error', 'error');
    };

    humeWs.onclose = (e) => {
        log(`Hume: Disconnected (${e.code})`);
        if (isSessionActive) stopSession();
    };
}

window.startHume = startHume;
