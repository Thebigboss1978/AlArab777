// ═══════════════════════════════════════════
// 2. Google Gemini Live (WebSocket)
// ═══════════════════════════════════════════
async function startGemini() {
    log('Gemini: Connecting via WebSocket...');

    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${config.apiKey}`;

    geminiWs = new WebSocket(wsUrl);

    geminiWs.onopen = () => {
        log('Gemini: WebSocket connected');
        // Send setup message
        const setup = {
            setup: {
                model: config.model.startsWith('models/') ? config.model : `models/${config.model}`,
                generation_config: {
                    response_modalities: ["AUDIO"],
                    speech_config: {
                        voice_config: {
                            prebuilt_voice_config: { voice_name: "Aoede" }
                        }
                    }
                },
                system_instruction: {
                    parts: [{ text: config.systemPrompt }]
                }
            }
        };
        geminiWs.send(JSON.stringify(setup));
    };

    geminiWs.onmessage = async (event) => {
        try {
            const data = JSON.parse(typeof event.data === 'string' ? event.data : await event.data.text());

            if (data.setupComplete) {
                log('Gemini: Setup complete, starting microphone', 'ok');
                isSessionActive = true;
                setState(STATE.LISTENING, 'Connected — speak now');
                startGeminiAudioStream();
                return;
            }

            if (data.serverContent) {
                const parts = data.serverContent.modelTurn?.parts || [];
                for (const part of parts) {
                    if (part.inlineData?.data) {
                        setState(STATE.SPEAKING, 'Responding...');
                        playBase64Audio(part.inlineData.data, part.inlineData.mimeType || 'audio/pcm;rate=24000');
                    }
                }
                if (data.serverContent.turnComplete) {
                    setState(STATE.LISTENING, 'Listening...');
                }
            }
        } catch(e) {
            log(`Gemini parse error: ${e.message}`, 'warn');
        }
    };

    geminiWs.onerror = (err) => {
        setState(STATE.ERROR, 'Gemini WebSocket error — check your API key or quota');
        log('Gemini: WebSocket error', 'error');
    };

    geminiWs.onclose = (e) => {
        log(`Gemini: WebSocket closed (code: ${e.code}, reason: ${e.reason || 'none'})`);
        if (e.code !== 1000 && isSessionActive) {
            setState(STATE.ERROR, `Gemini disconnected: ${e.reason || 'Connection lost'}`);
        }
        if (isSessionActive) stopSession();
    };
}

async function startGeminiAudioStream() {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
    audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(mediaStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
        if (!isSessionActive || !geminiWs || geminiWs.readyState !== 1) return;
        const pcmData = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
        }
        const base64 = arrayBufferToBase64(int16.buffer);
        geminiWs.send(JSON.stringify({
            realtimeInput: {
                mediaChunks: [{
                    mimeType: "audio/pcm;rate=16000",
                    data: base64
                }]
            }
        }));
    };
}

window.startGemini = startGemini;
