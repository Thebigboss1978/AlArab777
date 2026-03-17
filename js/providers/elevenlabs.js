// ═══════════════════════════════════════════
// 3. ElevenLabs Conversational AI (WebSocket)
// ═══════════════════════════════════════════
async function startElevenLabs() {
    log('ElevenLabs: Starting conversational session...');

    const agentId = config.elevenlabsAgent;
    if (!agentId) {
        throw new Error('ElevenLabs Agent ID is required. Set it in Settings.');
    }

    // Get signed URL
    const signResp = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
        headers: { 'xi-api-key': config.apiKey }
    });

    if (!signResp.ok) {
        const errText = await signResp.text();
        throw new Error(`ElevenLabs signed URL failed (${signResp.status}): ${errText}`);
    }

    const { signed_url } = await signResp.json();
    log('ElevenLabs: Got signed URL');

    elevenLabsWs = new WebSocket(signed_url);

    elevenLabsWs.onopen = async () => {
        log('ElevenLabs: WebSocket connected', 'ok');
        isSessionActive = true;
        setState(STATE.LISTENING, 'Connected — speak now');

        // Start sending mic audio
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
        audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(mediaStream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
            if (!isSessionActive || !elevenLabsWs || elevenLabsWs.readyState !== 1) return;
            const pcmData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
                int16[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
            }
            const base64 = arrayBufferToBase64(int16.buffer);
            elevenLabsWs.send(JSON.stringify({
                user_audio_chunk: base64
            }));
        };
    };

    elevenLabsWs.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'audio') {
                setState(STATE.SPEAKING, 'Responding...');
                if (data.audio?.chunk) {
                    playBase64Audio(data.audio.chunk, 'audio/pcm;rate=16000');
                }
            } else if (data.type === 'agent_response') {
                log(`ElevenLabs agent: ${data.agent_response_event || ''}`);
            } else if (data.type === 'user_transcript') {
                log(`You: ${data.user_transcript?.text || ''}`);
            } else if (data.type === 'interruption') {
                setState(STATE.LISTENING, 'Listening...');
            } else if (data.type === 'ping') {
                elevenLabsWs.send(JSON.stringify({ type: 'pong', event_id: data.event_id }));
            }
        } catch(e) {}
    };

    elevenLabsWs.onerror = () => {
        setState(STATE.ERROR, 'ElevenLabs connection error — check API key or Agent ID');
        log('ElevenLabs: WebSocket error', 'error');
    };

    elevenLabsWs.onclose = (e) => {
        log(`ElevenLabs: Disconnected (${e.code})`);
        if (isSessionActive) stopSession();
    };
}

window.startElevenLabs = startElevenLabs;
