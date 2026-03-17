
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionStatus, TranscriptionItem } from './types';
import { decode, decodeAudioData, createBlob, blobToBase64 } from './utils/audio-utils';
import Visualizer from './components/Visualizer';
import { PERSONAS, Persona } from './persona';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [history, setHistory] = useState<TranscriptionItem[]>([]);
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS.malika);
  const [isGroqMode, setIsGroqMode] = useState(true); // Default to Groq per user request
  const [intensity, setIntensity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const currentOutputTranscription = useRef('');

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
    u.lang = activePersona.id === 'malika' ? 'ar-EG' : 'ar-JO';
    u.rate = 1.05;
    u.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes(u.lang.split('-')[1])) || voices[0];
    if (voice) u.voice = voice;
    
    let timer: any;
    u.onstart = () => {
      timer = setInterval(() => setIntensity(Math.random() * 0.4 + 0.2), 100);
      setIsThinking(false);
    };
    u.onend = () => { clearInterval(timer); setIntensity(0); };
    u.onerror = () => { clearInterval(timer); setIntensity(0); };
    window.speechSynthesis.speak(u);
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
      rec.lang = activePersona.id === 'malika' ? 'ar-EG' : 'ar-JO';
      
      rec.onstart = () => {
        setStatus(ConnectionStatus.CONNECTED);
        speakResponse(activePersona.id === 'malika' ? "مليكة معاك يا زعيم، نفق جروك شغال." : "نشمية معك، أبشر باللي بدك اياه.");
      };

      rec.onresult = async (e: any) => {
        const text = e.results[e.results.length - 1][0].transcript.trim();
        if (text) {
          setHistory(prev => [...prev, { id: Math.random().toString(), text, sender: 'user', timestamp: new Date() }]);
          setIsThinking(true);
          const apiKey = process.env.GROQ_API_KEY;
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
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
    else { await wakeSystem(); isGroqMode ? startGroqEngine() : startGeminiEngine(); }
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

  const borderClass = activePersona.theme === 'emerald' ? 'border-emerald-500 shadow-emerald-900/20' : 'border-red-600 shadow-red-900/20';
  const textClass = activePersona.theme === 'emerald' ? 'text-emerald-500' : 'text-red-500';

  return (
    <div className="flex-1 flex flex-col h-screen w-full bg-black text-white font-mono overflow-hidden">
      
      {/* SOVEREIGN HEADER */}
      <header className="p-4 border-b border-white/5 bg-black/90 flex justify-between items-center z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 border-2 ${borderClass} rounded-full flex items-center justify-center animate-pulse`}>
            <i className={`fas fa-shield-halved ${textClass} text-sm`}></i>
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest uppercase">MALIKA-NASHMI <span className={textClass}>OS</span></h1>
            <p className="text-[7px] opacity-40 uppercase tracking-[0.2em]">Managed by Master Said | JUDY.777</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
          {Object.values(PERSONAS).map(p => (
            <button 
              key={p.id}
              onClick={() => switchPersona(p.id)}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${activePersona.id === p.id ? `bg-${p.theme === 'emerald' ? 'emerald' : 'red'}-600 text-white shadow-lg scale-105` : 'text-white/20 hover:text-white/50'}`}
            >
              {p.name.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* ACTION ZONE */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <Visualizer 
            isActive={status === ConnectionStatus.CONNECTED} 
            intensity={intensity} 
            theme={activePersona.theme === 'emerald' ? 'emerald' : 'red'} 
          />

          <div className="mt-4 w-full max-w-sm space-y-4">
            {error && <div className="text-center text-red-500 text-[9px] font-bold mb-2 animate-pulse">[FAULT_DETECTED: {error}]</div>}
            
            <button 
              onClick={handleToggle}
              className={`w-full py-5 rounded-2xl border-2 transition-all active:scale-95 font-black tracking-[0.4em] text-xs uppercase shadow-2xl ${
                status === ConnectionStatus.CONNECTED 
                ? 'border-white/10 text-white/20 bg-white/5' 
                : `${borderClass} ${textClass} bg-black/40`
              }`}
            >
              {status === ConnectionStatus.CONNECTED ? "TERMINATE LINK" : "INITIALIZE SOVEREIGN LINK"}
            </button>

            <div className="flex gap-3">
              <button onClick={() => { cleanup(); setIsGroqMode(!isGroqMode); }} className={`flex-1 py-3 border-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${isGroqMode ? 'border-orange-500 bg-orange-950/20 text-orange-500' : 'border-white/10 text-white/30'}`}>
                {isGroqMode ? 'GROQ_70B_TUNNEL' : 'GEMINI_NATIVE_LINK'}
              </button>
              <button onClick={() => setHistory([])} className="px-5 py-3 border border-white/10 rounded-xl text-white/20 hover:text-white/60"><i className="fas fa-trash-can"></i></button>
            </div>
            
            {isThinking && (
              <div className="text-center animate-pulse text-[8px] opacity-40 uppercase tracking-[0.5em] font-bold">
                [ PROCESSING_VIA_{isGroqMode ? 'GROQ' : 'GEMINI'} ]
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
