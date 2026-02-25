
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionStatus, TranscriptionItem } from './types';
import { decode, decodeAudioData, createBlob, blobToBase64 } from './utils/audio-utils';
import Visualizer from './components/Visualizer';
import { PERSONAS, Persona } from './persona';
import { VoiceOrb } from './components/VoiceOrb';
import { HotelCard } from './components/HotelCard';
import { SmartOrchestrator } from './engine/SmartOrchestrator';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [history, setHistory] = useState<TranscriptionItem[]>([]);
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS.judy_jordan_edu);
  const [isGroqMode, setIsGroqMode] = useState(true); 
  const [intensity, setIntensity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const currentOutputTranscription = useRef('');

  const orchestratorRef = useRef<SmartOrchestrator | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    orchestratorRef.current = new SmartOrchestrator({
      onStatusChange: (s) => setStatus(s),
      onMessage: (m) => speakResponse(m),
      onError: (e) => setError(e),
      startGemini: async (text, inst) => { await startGeminiEngine(); },
      startGroq: async (text, inst) => { await startGroqEngine(); },
      startLocal: async (text, inst) => { console.log("Local Sovereign Mode placeholder"); } 
    });

    // Sovereign Autonomous Layer: Ready the system as soon as possible
    const autoInitialize = async () => {
      console.log("Sovereign Link Initiating Automatically...");
      await wakeSystem();
      
      if (window.navigator.onLine) {
        isGroqMode ? startGroqEngine() : startGeminiEngine();
      } else {
        speakResponse("النظام في وضع السيادة المحلية. لا يوجد اتصال بالإنترنت.");
      }
    };

    // Delay slightly to ensure user interaction context if needed for audio
    const timer = setTimeout(autoInitialize, 1500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, [activePersona, isGroqMode]);

  const wakeSystem = async () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new AudioCtx({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      await inputAudioContextRef.current.resume();
      await outputAudioContextRef.current.resume();
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch (e) { console.error(e); }
  };

  const cleanup = useCallback(() => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} recognitionRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    setStatus(ConnectionStatus.DISCONNECTED);
    setIntensity(0);
    setIsThinking(false);
    window.speechSynthesis.cancel();
  }, []);

  const speakResponse = (text: string) => {
    if (!text) return;
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-JO';
    u.rate = 1.05;
    u.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes(u.lang.split('-')[1])) || voices[0];
    if (voice) u.voice = voice;
    
    let timer: any;
    u.onstart = () => {
      timer = setInterval(() => setIntensity(Math.random() * 0.4 + 0.2), 100);
      setIsThinking(false);
      setIsSpeaking(true);
    };
    u.onend = () => { clearInterval(timer); setIntensity(0); setIsSpeaking(false); };
    u.onerror = () => { clearInterval(timer); setIntensity(0); setIsSpeaking(false); };
    window.speechSynthesis.speak(u);
  };

  /* SOUND EFFECT */
  const playConnectionSound = () => {
    const audio = new Audio('/connection_chime.mp3');
    audio.volume = 0.5;
    audio.play().catch(console.error);
  };

  const startGroqEngine = async () => {
    setStatus(ConnectionStatus.CONNECTING);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRec) throw new Error("UNSUPPORTED");

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.lang = 'ar-JO';
      
      rec.onstart = () => {
        playConnectionSound();
        setStatus(ConnectionStatus.CONNECTED);
        speakResponse("نشمية معك، أبشر باللي بدك اياه.");
      };

      rec.onresult = async (e: any) => {
        const text = e.results[e.results.length - 1][0].transcript.trim();
        if (text) {
          setHistory(prev => [...prev, { id: Math.random().toString(), text, sender: 'user', timestamp: new Date() }]);
          setIsThinking(true);
          const apiKey = import.meta.env.VITE_GROQ_API_KEY;
          try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Upgraded per request
                messages: [{ role: "system", content: activePersona.systemInstruction }, { role: "user", content: text }],
                temperature: 0.7
              })
            });
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              setHistory(prev => [...prev, { id: Math.random().toString(), text: reply, sender: 'model', timestamp: new Date() }]);
              speakResponse(reply);
            }
          } catch (err) { speakResponse("خطأ في الاتصال بالسيرفر."); }
          finally { setIsThinking(false); }
        }
      };
      rec.start();
      recognitionRef.current = rec;
    } catch (e) { setStatus(ConnectionStatus.ERROR); }
  };

  const startGeminiEngine = async () => {
    setStatus(ConnectionStatus.CONNECTING);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            playConnectionSound();
            setStatus(ConnectionStatus.CONNECTED);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const script = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            script.onaudioprocess = (e) => {
              const d = e.inputBuffer.getChannelData(0);
              let sum = 0; for(let i=0; i<d.length; i++) sum += d[i]*d[i];
              setIntensity(Math.min(Math.sqrt(sum/d.length)*8, 1.0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(d) }));
            };
            source.connect(script); script.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.serverContent?.outputTranscription) currentOutputTranscription.current += m.serverContent.outputTranscription.text;
            const audio = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer; source.connect(ctx.destination);
              source.start(nextStartTimeRef.current); nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (m.serverContent?.turnComplete) {
              setHistory(prev => [...prev, { id: Math.random().toString(), text: currentOutputTranscription.current || "رسالة مشفرة", sender: 'model', timestamp: new Date() }]);
              currentOutputTranscription.current = '';
            }
          },
          onerror: () => cleanup(),
          onclose: () => cleanup()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: activePersona.systemInstruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: activePersona.voice } } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { setStatus(ConnectionStatus.ERROR); }
  };

  const handleToggle = async () => {
    if (status === ConnectionStatus.CONNECTED) cleanup();
    else { 
      await wakeSystem(); 
      // The Orchestrator now manages the cloud link
      isGroqMode ? startGroqEngine() : startGeminiEngine(); 
    }
  };

  const switchPersona = (id: string) => {
    const p = PERSONAS[id];
    if (p) {
      setActivePersona(p);
      if (status === ConnectionStatus.CONNECTED) {
        cleanup();
        setTimeout(() => handleToggle(), 400);
      }
    }
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'orange': return { border: 'border-orange-500 shadow-orange-900/20', text: 'text-orange-500', bg: 'bg-orange-600' };
      case 'emerald': return { border: 'border-emerald-500 shadow-emerald-900/20', text: 'text-emerald-500', bg: 'bg-emerald-600' };
      case 'purple': return { border: 'border-purple-500 shadow-purple-900/20', text: 'text-purple-500', bg: 'bg-purple-600' };
      case 'red': return { border: 'border-red-600 shadow-red-900/20', text: 'text-red-500', bg: 'bg-red-600' };
      default: return { border: 'border-white/20', text: 'text-white', bg: 'bg-white/20' };
    }
  };

  const themeColors = getThemeColors(activePersona.theme);
  const borderClass = themeColors.border;
  const textClass = themeColors.text;

  return (
    <div className="flex-1 flex flex-col h-screen w-full bg-black text-white font-mono overflow-hidden">
      
      {/* SOVEREIGN HEADER */}
      <header className="p-4 border-b border-white/5 bg-black/90 flex justify-between items-center z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 border-2 ${borderClass} rounded-full flex items-center justify-center animate-pulse`}>
            <i className={`fas fa-shield-halved ${textClass} text-sm`}></i>
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest uppercase">GLOBAL ARAB <span className={textClass}>CLOUD OS</span></h1>
            <p className="text-[7px] opacity-40 uppercase tracking-[0.2em]">Universal Brain: Gemini 2.5 + Groq 70B</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
          <span className="px-4 py-1.5 text-[9px] font-black text-white/50 uppercase">GLOBAL LINK: ONLINE</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* ACTION ZONE */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <VoiceOrb 
            isActive={status === ConnectionStatus.CONNECTED} 
            intensity={intensity} 
          />

          <div className="mt-4 w-full max-w-sm space-y-4">
            {error && <div className="text-center text-red-500 text-[9px] font-bold mb-2 animate-pulse">[FAULT_DETECTED: {error}]</div>}
            
            <div className="flex bg-white/5 p-4 rounded-2xl border border-white/10 items-center justify-between shadow-2xl relative overflow-hidden group">
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  isSpeaking ? 'bg-cyan-500 animate-bounce' : 
                  isThinking ? 'bg-orange-500 animate-pulse' : 
                  status === ConnectionStatus.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-white/20'
                }`}></div>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                  {isSpeaking ? 'VOCALIZING_IN_PROGRESS' : 
                   isThinking ? 'TUNNEL_PROCESSING' : 
                   status === ConnectionStatus.CONNECTED ? 'SENSING_FOR_SIGNAL' : 'IDLE'}
                </span>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <span className="text-[8px] opacity-40 uppercase font-black tracking-[0.1em]">{isOnline ? 'GLOBAL_LINK' : 'LOCAL_ONLY'}</span>
                <i className={`fas ${isOnline ? 'fa-globe animate-spin-slow' : 'fa-signal-slash'} text-[10px] ${isOnline ? 'text-cyan-500' : 'text-red-500'}`}></i>
              </div>
              {/* Progress-like effect based on intensity */}
              <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-500 transition-all duration-100" style={{ width: `${intensity * 100}%` }}></div>
            </div>

            <div className="flex gap-2">
               <div className={`flex-1 py-3 text-center border rounded-xl text-[8px] font-black tracking-widest uppercase transition-all ${isGroqMode ? 'border-orange-500/50 text-orange-500/80 bg-orange-950/10' : 'border-white/5 text-white/20'}`}>
                {isGroqMode ? 'GROQ_70B_TUNNEL' : 'GEMINI_NATIVE_LINK'}
              </div>
              <button onClick={() => setHistory([])} className="px-5 py-3 border border-white/10 rounded-xl text-white/20 hover:text-white/60 transition-colors"><i className="fas fa-trash-can"></i></button>
            </div>
            
            {isThinking && (
              <div className="text-center animate-pulse text-[8px] opacity-40 uppercase tracking-[0.5em] font-bold">
                [ {isOnline ? `TUNNELING_VIA_${isGroqMode ? 'GROQ' : 'GEMINI'}` : 'LOCAL_PROCESSING'} ]
              </div>
            )}
          </div>
        </div>

        {/* LOGS PANEL */}
        <div className="lg:w-[350px] border-l border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col">
          <div className="p-3 border-b border-white/5 flex justify-between items-center text-[8px] opacity-40 font-black uppercase tracking-widest">
            <span>Security Logs</span>
            <div className={`w-1.5 h-1.5 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-white/10'}`}></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px] font-bold custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                <i className="fas fa-satellite text-4xl"></i>
                <p className="tracking-[0.5em] text-[8px]">LISTENING_FOR_SIGNAL</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-500`}>
                  <span className="text-[7px] opacity-20 mb-1 tracking-widest">{item.sender === 'user' ? 'MASTER_SAID_CMD' : `${activePersona.name.toUpperCase()}_OUT`}</span>
                  <div className={`p-3 rounded-xl border-2 ${item.sender === 'user' ? 'bg-white/5 border-white/10 text-white/80' : `${borderClass} ${textClass} bg-black/60 shadow-lg`} max-w-[90%]`}>
                    {item.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default App;
