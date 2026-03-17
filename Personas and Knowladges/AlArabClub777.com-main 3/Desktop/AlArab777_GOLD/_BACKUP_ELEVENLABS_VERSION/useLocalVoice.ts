/// <reference types="vite/client" />
import { useState, useEffect, useRef, useCallback } from 'react';
import Groq from 'groq-sdk';
import { JUDY_SETTINGS } from '../config/judyConfig';

export type LocalVoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

export const useLocalVoice = () => {
  const [state, setState] = useState<LocalVoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  const shouldListenRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // 1. VOICE SELECTION (The Soul)
  const loadVoices = useCallback(() => {
    const voices = synthesisRef.current.getVoices();
    // Prioritize "Google" or "Microsoft" Arabic voices for better quality
    const arabicVoice = voices.find(v => v.lang.includes('ar') && (v.name.includes('Google') || v.name.includes('Maged'))) 
                     || voices.find(v => v.lang.includes('ar')); // Fallback to any Arabic
    
    if (arabicVoice) {
      voiceRef.current = arabicVoice;
    }
  }, []);

  useEffect(() => {
    loadVoices();
    if (synthesisRef.current.onvoiceschanged !== undefined) {
      synthesisRef.current.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  // 2. SPEAKING (ElevenLabs 🎵 + Local Fallback)
  const speak = useCallback(async (text: string) => {
    if (!text) return;
    
    // Stop listening temporarily
    try { recognitionRef.current?.stop(); } catch(e) {}

    setState("speaking");
    setReply(text);

    // TRY ELEVENLABS FIRST
    const elApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const elVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel default

    if (elApiKey && elApiKey.startsWith("sk_")) {
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elVoiceId}/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': elApiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2", // Best for Arabic
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!response.ok) throw new Error("ElevenLabs Error");

            const blob = await response.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            
            audio.onended = () => {
                if (shouldListenRef.current) {
                    setState("listening");
                    try { recognitionRef.current?.start(); } catch(e) {}
                } else {
                    setState("idle");
                }
            };
            
            audio.play();
            return; // Success, exit function

        } catch (err) {
            console.warn("ElevenLabs failed, falling back to local:", err);
            // Fallthrough to local TTS
        }
    }

    // LOCAL TTS FALLBACK (If ElevenLabs missing or fails)
    synthesisRef.current.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    
    utterance.pitch = 0.9; 
    utterance.rate = 1.1;  
    
    utterance.onend = () => {
      if (shouldListenRef.current) {
          setState("listening");
          try { recognitionRef.current?.start(); } catch(e) {} 
      } else {
          setState("idle");
      }
    };

    synthesisRef.current.speak(utterance);
  }, []);

  // 3. THINKING (AI Processing - WITH KEY ROTATION 🔄)
  const processText = async (input: string) => {
    setState("thinking");

    // 1. HARVEST KEYS (The Tunnel)
    // Gather all keys starting with VITE_GROQ_API_KEY...
    const env = import.meta.env;
    let keys: string[] = [];
    
    // Check for standard single key first
    if (env.VITE_GROQ_API_KEY && !env.VITE_GROQ_API_KEY.includes("enter_your_key")) {
        keys.push(env.VITE_GROQ_API_KEY);
    }
    
    // Check for rotation keys (1 to 5)
    for (let i = 1; i <= 5; i++) {
        const k = env[`VITE_GROQ_API_KEY_${i}`];
        if (k && !k.includes("KEY_HERE")) keys.push(k);
    }
    
    // Fallbacks
    if (keys.length === 0) {
        // Try fallback env vars
        const k = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.API_KEY;
        if (k) keys.push(k);
    }

    if (keys.length === 0) {
        setError("NO KEYS FOUND. Please check .env file.");
        speak("لا يوجد مفاتيح تشغيل.");
        setState("idle");
        return;
    }

    console.log(`Found ${keys.length} keys in the tunnel. Starting rotation...`);

    // 2. THE ROTATION LOOP
    let replyText = "";
    let success = false;

    for (const key of keys) {
        try {
            console.log(`Trying Key: ...${key.slice(-4)}`);
            
            const groq = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: JUDY_SETTINGS.systemInstruction.parts[0].text },
                    { role: "user", content: input }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 150,
            });

            replyText = completion.choices[0]?.message?.content || "";
            if (replyText) {
                success = true;
                break; // Exit loop on success
            }

        } catch (err: any) {
            console.warn(`Key failed: ...${key.slice(-4)}`, err.message);
            // Continue to next key...
        }
    }

    // 3. RESULT
    if (success && replyText) {
        speak(replyText);
    } else {
        console.error("All keys failed.");
        // speak("عذراً، حدث خطأ في النظام."); // REMOVED: User hates canned errors
        setError("ALL KEYS FAILED. CHECK NETWORK.");
        setState("idle");
    }
  };

  // 4. HEARING (STT)
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Browser not supported");
      return;
    }

    // Initialize only if not already exists or if stopped
    if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'ar-EG'; 
        recognitionRef.current.continuous = false; // We use restart loop instead of continuous
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onstart = () => {
            if (state !== "speaking" && state !== "thinking") setState("listening");
        };
        
        recognitionRef.current.onresult = (event: any) => {
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript;
          if (text.trim()) {
              setTranscript(text);
              // Debounce to avoid multiple triggers - REDUCED TO 250ms for SPEED
              if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = setTimeout(() => {
                  processText(text);
              }, 250); 
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'no-speech') return; // Ignore
          console.error("Speech Error:", event.error);
        };

        recognitionRef.current.onend = () => {
           // Auto-restart if we should be listening and not speaking/thinking
           if (shouldListenRef.current && state !== "speaking" && state !== "thinking") {
               setTimeout(() => { 
                   try { recognitionRef.current.start(); } catch(e){} 
               }, 100); // Reduced restart delay
           }
        };
    }

    try { recognitionRef.current.start(); } catch(e) {}
  }, [state]);

  const toggle = useCallback(() => {
    if (shouldListenRef.current) {
        // Stop
        shouldListenRef.current = false;
        try { recognitionRef.current?.stop(); } catch(e) {}
        synthesisRef.current.cancel();
        setState("idle");
    } else {
        // Start
        shouldListenRef.current = true;
        setState("listening");
        startListening();
    }
  }, [startListening]);

  return { state, transcript, reply, error, isActive: shouldListenRef.current, toggle };
};
