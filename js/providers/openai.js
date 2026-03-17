// ═══════════════════════════════════════════
// 1. OpenAI Realtime (WebRTC)
// ═══════════════════════════════════════════
async function startOpenAI() {
    log('OpenAI: Requesting ephemeral token...');

    // 1. Get ephemeral token
    const tokenResp = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: config.model,
            voice: 'verse',
            instructions: config.systemPrompt,
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { type: 'server_vad' }
        })
    });

    if (!tokenResp.ok) {
        const errBody = await tokenResp.text();
        throw new Error(`OpenAI token request failed (${tokenResp.status}): ${errBody}`);
    }

    const tokenData = await tokenResp.json();
    const ephemeralKey = tokenData.client_secret?.value;
    if (!ephemeralKey) throw new Error('No ephemeral key in response');
    log('OpenAI: Ephemeral token received');

    // 2. Create PeerConnection
    peerConnection = new RTCPeerConnection();

    // Audio output
    audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    peerConnection.ontrack = (e) => {
        audioElement.srcObject = e.streams[0];
        log('OpenAI: Audio track received');
    };

    // Data channel for events
    dataChannel = peerConnection.createDataChannel('oai-events');
    dataChannel.onopen = () => {
        log('OpenAI: Data channel open');
        isSessionActive = true;
        setState(STATE.LISTENING, 'Connected — speak now');
    };
    dataChannel.onmessage = (e) => {
        try {
            const evt = JSON.parse(e.data);
            handleOpenAIEvent(evt);
        } catch(err) {}
    };
    dataChannel.onclose = () => {
        log('OpenAI: Data channel closed');
        if (isSessionActive) stopSession();
    };

    // 3. Microphone
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream.getTracks().forEach(t => peerConnection.addTrack(t, mediaStream));
    log('OpenAI: Microphone access granted');

    // 4. Create offer and set local description
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // 5. Send to OpenAI
    const sdpResp = await fetch(`https://api.openai.com/v1/realtime?model=${config.model}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp'
        },
        body: offer.sdp
    });

    if (!sdpResp.ok) throw new Error(`OpenAI SDP exchange failed (${sdpResp.status})`);

    const answerSdp = await sdpResp.text();
    await peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    log('OpenAI: WebRTC connection established', 'ok');
}

function handleOpenAIEvent(evt) {
    switch (evt.type) {
        case 'session.created':
            log('OpenAI: Session created');
            break;
        case 'input_audio_buffer.speech_started':
            setState(STATE.LISTENING, 'Hearing you...');
            break;
        case 'input_audio_buffer.speech_stopped':
            setState(STATE.THINKING, 'Processing your speech...');
            break;
        case 'response.audio.delta':
            if (currentState !== STATE.SPEAKING) {
                setState(STATE.SPEAKING, 'Responding...');
            }
            break;
        case 'response.audio.done':
            setState(STATE.LISTENING, 'Listening...');
            break;
        case 'response.done':
            setState(STATE.LISTENING, 'Listening...');
            break;
        case 'error':
            const errMsg = evt.error?.message || 'Unknown error';
            setState(STATE.ERROR, `OpenAI error: ${errMsg}`);
            log(`OpenAI error: ${errMsg}`, 'error');
            break;
        case 'input_audio_buffer.committed':
        case 'conversation.item.created':
        case 'response.created':
        case 'response.output_item.added':
        case 'response.content_part.added':
        case 'response.audio_transcript.delta':
        case 'response.audio_transcript.done':
        case 'response.output_item.done':
        case 'response.content_part.done':
        case 'rate_limits.updated':
            // Silent events
            break;
        default:
            log(`OpenAI event: ${evt.type}`);
    }
}

window.startOpenAI = startOpenAI;
