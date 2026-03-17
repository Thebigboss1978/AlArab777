
import { useState, useRef, useCallback, useEffect } from 'react';
import { AgentState } from '../types';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { JUDY_SETTINGS } from '../config/judyConfig';

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

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> {
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const dataInt16 = new Int16Array(arrayBuffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export const useVoiceAgent = () => {
  const [state, setState] = useState<AgentState>(AgentState.DISCONNECTED);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const playbackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const disconnect = useCallback(() => {
    setState(AgentState.DISCONNECTED);
    setAudioLevel(0);
    if (sessionRef.current) { try { sessionRef.current.close(); } catch(e) {} sessionRef.current = null; }
    if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
    playbackSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    playbackSourcesRef.current.clear();
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    nextStartTimeRef.current = 0;
  }, []);

  const connect = useCallback(async () => {
    if (state !== AgentState.DISCONNECTED && state !== AgentState.ERROR) return;

    try {
      setState(AgentState.CONNECTING);
      
      const micPromise = navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: JUDY_SETTINGS.AUDIO.outputSampleRate 
      });
      audioContextRef.current = ctx;
      await ctx.resume();

      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      
      const connectedSession = await ai.live.connect({
        model: JUDY_SETTINGS.CONNECTION.googleModel,
        callbacks: {
          onopen: () => {
            setState(AgentState.LISTENING);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setState(AgentState.SPEAKING);
              if (ctx.state === 'suspended') await ctx.resume();
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, JUDY_SETTINGS.AUDIO.outputSampleRate);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              const currentTime = ctx.currentTime;
              if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime + 0.05;
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              playbackSourcesRef.current.add(source);
              source.onended = () => {
                playbackSourcesRef.current.delete(source);
                if (playbackSourcesRef.current.size === 0) setState(AgentState.LISTENING);
              };
            }
            if (message.serverContent?.interrupted) {
              playbackSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              playbackSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setState(AgentState.LISTENING);
            }
          },
          onerror: (e) => {
            console.error("Session Error", e);
            // Handling 503 Service Unavailable or network issues
            setState(AgentState.ERROR);
            disconnect();
          },
          onclose: () => disconnect(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: JUDY_SETTINGS.CONNECTION.googleVoice } } },
          systemInstruction: JUDY_SETTINGS.systemInstruction,
        }
      });
      
      sessionRef.current = connectedSession;

      // Delayed Trigger for Stability
      setTimeout(() => {
        try {
          if (sessionRef.current && typeof sessionRef.current.send === 'function') {
            sessionRef.current.send({ parts: [{ text: JUDY_SETTINGS.INITIAL_TRIGGER_MESSAGE }] });
          }
        } catch (e) {
          console.warn("Trigger skipped", e);
        }
      }, 500);

      const stream = await micPromise;
      streamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
        if (!sessionRef.current || state === AgentState.SPEAKING) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(inputData.length);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
          let sample = inputData[i] * JUDY_SETTINGS.AUDIO.inputGain;
          int16[i] = Math.max(-1, Math.min(1, sample)) * 32767;
        }
        setAudioLevel(Math.sqrt(sum / inputData.length)); 
        
        try { 
            sessionRef.current.sendRealtimeInput({ 
                media: { 
                    data: encode(new Uint8Array(int16.buffer)), 
                    mimeType: 'audio/pcm;rate=16000' 
                } 
            }); 
        } catch (err) {}
      };
      
      source.connect(scriptProcessor);
      scriptProcessor.connect(ctx.destination);

    } catch (err) {
      console.error("Connection Failed", err);
      setState(AgentState.ERROR);
      disconnect();
    }
  }, [disconnect, state]);

  useEffect(() => { return () => disconnect(); }, [disconnect]);
  return { state, audioLevel, connect, disconnect };
};
