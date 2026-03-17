
import { useState, useRef, useCallback, useEffect } from 'react';
import { AgentState } from '../types';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';
import { JUDY_SETTINGS } from '../config/judyConfig';

// PCM Encoding/Decoding Helpers
function encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const useVoiceAgent = () => {
  const [state, setState] = useState<AgentState>(AgentState.DISCONNECTED);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const playbackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Cleanup Function
  const disconnect = useCallback(() => {
    setState(AgentState.DISCONNECTED);
    setAudioLevel(0);
    
    // Close Session
    if (sessionRef.current) {
       try { sessionRef.current.close(); } catch(e) {}
       sessionRef.current = null;
    }

    // Stop Audio Processing
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    // Stop Playback
    playbackSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    playbackSourcesRef.current.clear();

    // Stop Mic Stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }

    // Close Contexts
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    audioContextInRef.current = null;
    audioContextOutRef.current = null;
    nextStartTimeRef.current = 0;
  }, []);

  // --- GOOGLE ENGINE LOGIC ---
  const connectGoogle = async (outCtx: AudioContext) => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
          console.error("FATAL: API Key is missing. Check .env file.");
          alert("JUDY SYSTEM ALERT: API Key Not Found. Please configure the environment.");
          throw new Error("API_KEY is missing in environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      try {
        const session = await ai.live.connect({
            model: JUDY_SETTINGS.CONNECTION.googleModel,
            callbacks: {
            onopen: () => {
                console.log("Judy OS: Connection Established (Google Engine)");
                // --- THE "THING" REMINDER ---
                console.log(">>> SYSTEM REMINDER: PREPARE 3-AI SYNC (GOOGLE, GPT, ELEVENLABS) FOR VIDEO EPISODE <<<");

                setState(AgentState.LISTENING);
                
                // --- THE INITIATIVE PROTOCOL (DIRECTOR'S CUT) ---
                // Increased delay to 1000ms to ensure WebSocket handshake is 100% complete.
                if (sessionRef.current) {
                console.log("Judy OS: CUE ACTION! (Waiting for stage light...)");
                setTimeout(() => {
                    try {
                        // Only send if we are still connected
                        if (sessionRef.current) {
                            console.log("Judy OS: ACTION!");
                            sessionRef.current.send({ parts: [{ text: JUDY_SETTINGS.INITIAL_TRIGGER_MESSAGE }] });
                        }
                    } catch (e) {
                        console.warn("Trigger failed (non-fatal):", e);
                    }
                }, 1000); 
                }
            },
            onmessage: async (message: LiveServerMessage) => {
                // Handle Incoming Audio (Judy Speaking)
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                setState(AgentState.SPEAKING);
                
                try {
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, JUDY_SETTINGS.AUDIO.outputSampleRate);
                    const source = outCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outCtx.destination);
                    
                    const currentTime = outCtx.currentTime;
                    if (nextStartTimeRef.current < currentTime) {
                    nextStartTimeRef.current = currentTime;
                    }
                    
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    
                    playbackSourcesRef.current.add(source);
                    
                    source.onended = () => {
                    playbackSourcesRef.current.delete(source);
                    if (playbackSourcesRef.current.size === 0) {
                        setState(AgentState.LISTENING);
                    }
                    };
                } catch (err) {
                    console.error("Audio Decode Error:", err);
                }
                }
                
                // Handle Interruption
                if (message.serverContent?.interrupted) {
                playbackSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
                playbackSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setState(AgentState.LISTENING);
                }
            },
            onerror: (e) => {
                console.error("Agent Runtime Error:", e);
                // Do not throw alert, just reset state so user can try again
                setState(AgentState.ERROR);
                disconnect();
            },
            onclose: () => {
                console.log("Judy OS: Connection Closed");
                disconnect();
            },
            },
            config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: JUDY_SETTINGS.CONNECTION.googleVoice } } },
            systemInstruction: JUDY_SETTINGS.systemInstruction,
            }
        });

        sessionRef.current = session;
        return session;

      } catch (connError) {
          console.error("WebSocket Handshake Failed:", connError);
          setState(AgentState.ERROR);
          disconnect();
          throw connError;
      }
  };

  const connect = useCallback(async () => {
    if (state === AgentState.CONNECTING || state === AgentState.LISTENING) return;

    try {
      setState(AgentState.CONNECTING);
      
      // 1. Get Microphone Access FIRST
      // This ensures we have permission before hitting the API, avoiding empty sessions.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Initialize Audio Contexts
      const inCtx = new AudioContext({ sampleRate: JUDY_SETTINGS.AUDIO.inputSampleRate });
      const outCtx = new AudioContext({ sampleRate: JUDY_SETTINGS.AUDIO.outputSampleRate });
      
      await inCtx.resume();
      await outCtx.resume();

      audioContextInRef.current = inCtx;
      audioContextOutRef.current = outCtx;

      // 3. ROUTING LOGIC (The Switch) & Connect to AI
      if (JUDY_SETTINGS.ACTIVE_PROVIDER === 'GOOGLE') {
          await connectGoogle(outCtx);
      } else {
          console.warn("Provider not yet implemented in this web build:", JUDY_SETTINGS.ACTIVE_PROVIDER);
          await connectGoogle(outCtx); 
      }

      // 4. Start Audio Processing Loop
      // Only start processing once the session is active (handled by connectGoogle awaiting)
      const source = inCtx.createMediaStreamSource(stream);
      const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
        if (!sessionRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(inputData.length);
        
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        
        if (rms < JUDY_SETTINGS.AUDIO.noiseThreshold) {
          setAudioLevel(0);
          for (let i = 0; i < inputData.length; i++) int16[i] = 0;
        } else {
          setAudioLevel(rms); 
          for (let i = 0; i < inputData.length; i++) {
            let sample = inputData[i] * JUDY_SETTINGS.AUDIO.inputGain;
            sample = Math.max(-1, Math.min(1, sample));
            int16[i] = sample * 32767;
          }
        }
        
        if (JUDY_SETTINGS.ACTIVE_PROVIDER === 'GOOGLE') {
            const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
            };
            try {
                // Ensure the session is actually ready before sending
                sessionRef.current.sendRealtimeInput({ media: pcmBlob });
            } catch (err) {
                // Suppress minor send errors during state transitions
            }
        }
      };
      
      source.connect(scriptProcessor);
      scriptProcessor.connect(inCtx.destination);

    } catch (err) {
      console.error("Connection Failed:", err);
      setState(AgentState.ERROR);
      // Removed the auto-disconnect timeout here to let the UI show the error state briefly
      setTimeout(() => disconnect(), 2000);
    }
  }, [disconnect, state]);

  // Clean up on unmount
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { state, audioLevel, connect, disconnect };
};
