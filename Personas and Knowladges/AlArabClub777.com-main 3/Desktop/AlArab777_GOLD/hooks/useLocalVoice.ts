/// <reference types="vite/client" />
import { useState, useEffect, useRef, useCallback } from 'react';
import Groq from 'groq-sdk';
import { JUDY_SETTINGS, PERSONAS, TUNNELS } from '../config/judyConfig';

export type LocalVoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

export const useLocalVoice = () => {
  const [state, setState] = useState<LocalVoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("UNKNOWN");
  const [voiceMode, setVoiceMode] = useState<"CLOUD" | "LOCAL">("LOCAL"); 
  const [brainMode, setBrainMode] = useState<"GROQ" | "GEMINI" | "OFFLINE">("OFFLINE");

  const locationRef = useRef(location);
  const shouldListenRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const debounceTimerRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null); // Track ElevenLabs audio

  // 1. GEO-DETECTION & VOICE SETUP
  useEffect(() => {
    locationRef.current = location; // Monitor location changes
  }, [location]);

  useEffect(() => {
    // 1. FORCED LOCATION (GODFATHER MODE)
    let detectedLoc = "EGYPT"; 
    setLocation(detectedLoc);
    // locationRef.current will be updated by the dependency effect above
    console.log("📍 LOCATION LOCKED:", detectedLoc);

    // Load Local Voices
    const loadVoices = () => {
      const voices = synthesisRef.current.getVoices();
      const arabicVoice = voices.find(v => v.lang.includes('ar') && (v.name.includes('Google') || v.name.includes('Maged'))) 
                       || voices.find(v => v.lang.includes('ar'));
      if (arabicVoice) voiceRef.current = arabicVoice;
    };
    loadVoices();
    synthesisRef.current.onvoiceschanged = loadVoices;
  }, []);

  // 2. SMART SPEAKING ROUTER (The "Watermelon" Fix 🍉)
  
  // A. LOCAL FALLBACK (Fast & Reliable)
  const speakLocal = useCallback((text: string) => {
      // Cancel Cloud Audio if playing
      if (activeAudioRef.current) {
          activeAudioRef.current.pause();
          activeAudioRef.current = null;
      }
      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      
      // ✨ ANTIGRAVITY TUNING ✨
      utterance.pitch = 0.9; 
      utterance.rate = 1.1;  
      
      utterance.onend = () => {
        if (shouldListenRef.current) {
            setState("listening");
            try { recognitionRef.current?.start(); } catch(e) {} 
        } else { setState("idle"); }
      };

      synthesisRef.current.speak(utterance);
  }, []);

  // B. HYBRID ORCHESTRATOR (The Race)
  const speak = useCallback(async (text: string) => {
    if (!text) return;
    
    // STOP EVERYTHING FIRST
    try { recognitionRef.current?.stop(); } catch(e) {}
    synthesisRef.current.cancel();
    if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
    }

    setState("speaking");
    setReply(text);

    // DECISION MATRIX
    let useElevenLabs = true; // FORCE ON
    let selectedVoiceId = JUDY_SETTINGS.VOICE_IDS.MALIQA; // FORCE MALIQA

    // @ts-ignore
    const elApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;

    // IF No Key -> Direct Local
    if (!useElevenLabs || !elApiKey || !elApiKey.startsWith("sk_")) {
        setVoiceMode("LOCAL");
        speakLocal(text);
        return;
    }

    // ⭐️ THE RACE: Cloud vs Time (20s limit - FORCE CLOUD)
    // User hates robotic voice. We wait.
    const elVoiceId = selectedVoiceId || "21m00Tcm4TlvDq8ikWAM"; 
    const controller = new AbortController();
    
    // UI: Show loading state
    setVoiceMode("CLOUD"); 

    const timeoutId = setTimeout(() => {
        controller.abort(); 
        console.warn("🔻 Cloud Voice Huge Timeout (20s) -> Switching to Local");
        setVoiceMode("LOCAL"); 
        speakLocal(text); 
    }, 20000); // INCREASED TO 20 SECONDS

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elVoiceId}/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'xi-api-key': elApiKey },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            }),
            signal: controller.signal 
        });

        clearTimeout(timeoutId); // We made it!

        if (!response.ok) throw new Error("ElevenLabs API Error");

        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        activeAudioRef.current = audio; 
        
        audio.onended = () => {
            activeAudioRef.current = null;
            if (shouldListenRef.current) {
                setState("listening");
                try { recognitionRef.current?.start(); } catch(e) {}
            } else { setState("idle"); }
        };
        
        audio.play();
        setVoiceMode("CLOUD"); // Confirm Cloud
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
             // Timeout
        } else {
             console.warn("🔻 ElevenLabs Error -> Switching to Local", err);
             // SHOW THE ERROR TO THE USER
             setError(`CLOUD VOICE FAILED: ${err.message || "Unknown"}`);
             setVoiceMode("LOCAL");
             speakLocal(text); 
        }
    }
  }, [location, speakLocal]); 

  // 3. THINKING (Groq with Location Context - The REAL Brain)
  const processText = async (input: string) => {
    setState("thinking");

    // Keys Harvest (Robust: Check VITE_ prefix AND process.env fallback)
    const env = import.meta.env;
    // @ts-ignore
    const processEnv = process.env || {};

    let groqKeys: string[] = [];
    const possibleGroq = [
        env.VITE_GROQ_API_KEY, processEnv.GROQ_API_KEY_1, processEnv.GROQ_API_KEY_2, processEnv.GROQ_API_KEY_3,
        env.VITE_GROQ_API_KEY_1, env.VITE_GROQ_API_KEY_2, env.VITE_GROQ_API_KEY_3
    ];
    possibleGroq.forEach(k => {
        if (k && !k.includes("enter_your_key") && !k.includes("KEY_HERE")) groqKeys.push(k);
    });
    
    // ... (rest of logic)

    // ATTEMPT 1: GEMINI FLASH (Primary)
    // Check VITE first, then process.env
    const geminiKey = env.VITE_GEMINI_API_KEY || processEnv.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.includes("enter_your_key")) {
            try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${input}` }] }]
                })
            });
            const data = await res.json();
            replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (replyText) {
                    success = true;
                    setBrainMode("GEMINI"); // 🧠 BRAIN: GEMINI (PRIMARY)
            }
            } catch (err) { console.error("Gemini Failed", err); }
    }

    // ATTEMPT 2: GROQ (Fallback - The Heavy Lifter with ROTATION)
    if (!success) {
        // Collect ALL Available Keys
        if (!groqKeys.length) console.warn("⚠️ No Groq Keys Found!");

        // Try Keys in Round-Robin
        for (let i = 0; i < groqKeys.length; i++) {
            const currentKey = groqKeys[i];
            console.log(`🔄 Trying Key ${i + 1}/${groqKeys.length}...`);
            
            try {
                const groq = new Groq({ apiKey: currentKey, dangerouslyAllowBrowser: true });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: input }
                    ],
                    model: TUNNELS.GROQ_CLOUD.model, 
                    temperature: 0.8, 
                    max_tokens: TUNNELS.GROQ_CLOUD.maxTokens,
                });

                replyText = completion.choices[0]?.message?.content || "";
                if (replyText) {
                    success = true;
                    setBrainMode("GROQ"); // 🧠 BRAIN: GROQ
                    console.log(`✅ Key ${i + 1} Success!`);
                    break; // STOP LOOP ON SUCCESS
                }
            } catch (err: any) { 
                console.warn(`❌ Key ${i + 1} Failed:`, err.message);
                // Continue to next key...
            }
        }
    }

    if (success && replyText) {
        speak(replyText);
    } else {
        // FAIL SAFE RESPONSES
        console.error("ALL AI FAILED");
        setState("idle");
        // Don't just silence, give feedback if it was an error
        if (groqKeys.length === 0 && !env.VITE_GEMINI_API_KEY) {
             speak("System Error. No Intelligence Keys Found.");
        } else {
             // Likely a safety block or network error
             speak("..."); // Just speak dots to clear thinking state
        }
    }
  };

  const processingRef = useRef(false);

  // ... (inside useEffect or component)

  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<any>(null);

  // ... (existing refs)

  // HELPER: MIC VISUALIZER
  const startVisualizer = async () => {
      try {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          if (audioContextRef.current.state === 'suspended') {
             await audioContextRef.current.resume();
          }

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
          sourceRef.current.connect(analyserRef.current);

          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const tick = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              
              // Calculate Average Volume
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              
              // Normalize to 0-100 roughly
              setVolume(Math.min(100, avg * 2)); 
              
              if (shouldListenRef.current) {
                  animationFrameRef.current = requestAnimationFrame(tick);
              }
          };
          tick();
      } catch (err) {
          console.error("Visualizer Error:", err);
      }
  };

  const stopVisualizer = () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (sourceRef.current) {
          // sourceRef.current.disconnect(); // Keep connected to avoid breaking?
      }
      setVolume(0);
  };

  // 4. HEARING (STT - ROBUST LOOP FIX)
  const startListening = useCallback(() => {
    // START VISUALIZER PARALLEL TO STT
    startVisualizer();

    // ... (rest of STT logic) =>
    if (!recognitionRef.current) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("BROWSER NOT SUPPORTED (Use Chrome)");
            return;
        }
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = location === "UAE" ? "ar-AE" : "ar-EG";
        
        recognitionRef.current.onresult = (event: any) => {
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript;
          if (text.trim()) {
              processingRef.current = true;
              try { recognitionRef.current.stop(); } catch(e) {}
              setTranscript(text);
              if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = setTimeout(() => {
                  processText(text);
              }, 1000); 
          }
        };

        recognitionRef.current.onerror = (event: any) => { 
            console.warn("Speech Error:", event.error);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setError("MIC BLOCKED: Check Browser Permissions");
                shouldListenRef.current = false; 
                setState("error");
            }
        };

        recognitionRef.current.onend = () => {
           if (shouldListenRef.current && !processingRef.current && state === "listening") {
               try { recognitionRef.current.start(); } catch(e){}
           } else {
               // Stop visualizer when truly ending
               if (!shouldListenRef.current) stopVisualizer();
           }
        };
    }

    try { 
        processingRef.current = false; 
        recognitionRef.current.start(); 
        setError(null); 
    } catch(e) {}
  }, [state, location]); 

  const toggle = useCallback(() => {
    if (shouldListenRef.current) {
        shouldListenRef.current = false;
        try { recognitionRef.current?.stop(); } catch(e) {}
        stopVisualizer(); // Stop graphics
        synthesisRef.current.cancel();
        if (activeAudioRef.current) {
            activeAudioRef.current.pause();
            activeAudioRef.current = null;
        }
        setState("idle");
    } else {
        shouldListenRef.current = true;
        setState("listening");
        startListening();
    }
  }, [startListening]);

  return { state, transcript, reply, error, isActive: shouldListenRef.current, toggle, location, volume, voiceMode, brainMode };
};
