/// <reference types="vite/client" />
import { useState, useEffect, useRef, useCallback } from 'react';
import Groq from 'groq-sdk'; // Switched to Groq
import { JUDY_SETTINGS } from '../config/judyConfig';

export enum AgentState {
  DISCONNECTED = 'DISCONNECTED',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR',
}

export const useLocalVoice = () => {
  const [state, setState] = useState<AgentState>(AgentState.DISCONNECTED);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // 1. VOICE SELECTION (The Soul)
  const loadVoices = useCallback(() => {
    const voices = synthesisRef.current.getVoices();
    // Prioritize "Google" or "Microsoft" Arabic voices for better quality
    const arabicVoice = voices.find(v => v.lang.includes('ar') && (v.name.includes('Google') || v.name.includes('Maged'))) 
                     || voices.find(v => v.lang.includes('ar')); // Fallback to any Arabic
    
    if (arabicVoice) {
      voiceRef.current = arabicVoice;
      console.log("Selected Voice:", arabicVoice.name);
    }
  }, []);

  useEffect(() => {
    loadVoices();
    if (synthesisRef.current.onvoiceschanged !== undefined) {
      synthesisRef.current.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  // 2. SPEAKING (TTS)
  const speak = useCallback((text: string) => {
    if (!text) return;
    setState(AgentState.SPEAKING);
    // Cancellation ensures no overlap
    synthesisRef.current.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceRef.current;
    
    // TUNING: The "Soul" Parameters
    utterance.pitch = 0.9; // Slightly deeper for authority/calmness
    utterance.rate = 1.1;  // Slightly faster for intelligence/wit
    utterance.volume = 1.0;

    utterance.onend = () => {
      setState(AgentState.LISTENING);
      // Restart listening after speaking
      try { recognitionRef.current?.start(); } catch(e) {} 
    };

    synthesisRef.current.speak(utterance);
    setResponse(text);
  }, []);

  // 3. THINKING (AI Processing - NOW POWERED BY GROQ 🚀)
  const processText = async (input: string) => {
    setState(AgentState.THINKING);
    try {
        // Support VITE_ prefix or standard env vars
        const apiKey = import.meta.env.VITE_GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "gsk_..."; 
        
        if (!apiKey || apiKey === "gsk_...") {
             console.warn("Groq API Key missing, checking for fallback...");
             // You might want to throw error here if strict
        }

        const groq = new Groq({ 
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Required for local-first speed
        });

        const prompt = `
        ${JUDY_SETTINGS.systemInstruction}
        User said: "${input}"
        Reply in a short, conversational Arabic sentence. No emojis.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: JUDY_SETTINGS.systemInstruction },
                { role: "user", content: input }
            ],
            model: "llama-3.3-70b-versatile", // Super fast model
            temperature: 0.7,
            max_tokens: 100,
        });

        const reply = completion.choices[0]?.message?.content || "";
        
        if (reply) {
            speak(reply);
        } else {
            throw new Error("Empty response from Groq");
        }

    } catch (error) {
        console.error("Groq AI Error:", error);
        speak("حدث خطأ في الاتصال بالسيرفر السريع."); 
        setState(AgentState.LISTENING);
    }
  };

  // 4. HEARING (STT)
  const connect = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition. Please use Chrome.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'ar-EG'; // Egyptian Arabic
    recognitionRef.current.continuous = false; // Capture sentence by sentence
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setState(AgentState.LISTENING);
    
    recognitionRef.current.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
      console.log("Heard:", text);
      processText(text);
    };

    recognitionRef.current.onerror = (event: any) => {
      if (event.error === 'no-speech') {
          // Ignore silence, just restart
          return; 
      }
      console.error("Speech Error:", event.error);
    };

    recognitionRef.current.onend = () => {
       // Only restart if we are NOT speaking or thinking
       if (state === AgentState.LISTENING || state === AgentState.DISCONNECTED) {
           // Small delay to prevent CPU loop
           // setTimeout(() => { try { recognitionRef.current.start(); } catch(e){} }, 500);
       }
    };

    recognitionRef.current.start();
  }, []);

  const disconnect = useCallback(() => {
    setState(AgentState.DISCONNECTED);
    try { recognitionRef.current?.stop(); } catch(e) {}
    synthesisRef.current.cancel();
  }, []);

  return { state, transcript, response, connect, disconnect };
};
