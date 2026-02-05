
import React, { useEffect, useRef } from 'react';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { AgentState } from '../types';

interface Props {
  mode: 'full' | 'widget';
  onToggleMode: () => void;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  blinkSpeed: number;
}

export const VoiceOrb: React.FC<Props> = ({ mode, onToggleMode }) => {
  const { state, audioLevel, connect, disconnect } = useVoiceAgent();
  const isProcessing = state === AgentState.CONNECTING;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  
  const isWidget = mode === 'widget';

  const handleInteraction = () => { 
    if (state === AgentState.DISCONNECTED || state === AgentState.ERROR) {
      connect();
    } else {
      disconnect();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let time = 0;
    let raf: number;

    const resize = () => {
      // Force full scaling to parent container
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const starCount = isWidget ? 50 : (window.innerWidth < 768 ? 200 : 400); // Fewer stars on mobile
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (window.innerWidth < 768 ? 1.2 : 1.8),
        opacity: Math.random(),
        blinkSpeed: 0.005 + Math.random() * 0.02
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Deep Space Starfield
      starsRef.current.forEach(star => {
        const blink = 0.2 + Math.abs(Math.sin(time * star.blinkSpeed)) * 0.8;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * blink})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Orb Dynamics - Responsive Sizing
      // On mobile, orb is slightly smaller relative to width. On Desktop, it's larger.
      const screenSizeFactor = Math.min(canvas.width, canvas.height) * 0.001; 
      const baseRadius = isWidget ? 20 : (window.innerWidth < 768 ? 50 : 80);
      
      const pulse = Math.sin(time * 0.05) * 5;
      const responseScale = state === AgentState.SPEAKING ? (isWidget ? 50 : 200) : (isWidget ? 20 : 100);
      const activeSize = baseRadius + (audioLevel * responseScale) + pulse;
      
      // Outer Galactic Glow
      const glow1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, activeSize * 3);
      glow1.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
      glow1.addColorStop(0.7, 'rgba(212, 175, 55, 0.05)');
      glow1.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(cx, cy, activeSize * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Core Aura
      const glow2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, activeSize * 1.2);
      glow2.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glow2.addColorStop(0.2, 'rgba(212, 175, 55, 0.9)');
      glow2.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(cx, cy, activeSize * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Central Singularity
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = isWidget ? 15 : 50;
      ctx.shadowColor = '#D4AF37';
      ctx.beginPath();
      ctx.arc(cx, cy, (isWidget ? 5 : 12) + (audioLevel * 20), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      time++;
      raf = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [audioLevel, state, isProcessing, isWidget]);

  return (
    <div 
      className={`fixed transition-all duration-1000 ease-in-out z-[9999] overflow-hidden cursor-pointer ${
        isWidget ? 'bottom-6 right-6 w-40 h-40 rounded-full border-2 border-pharaonic-gold/40 bg-black shadow-[0_0_50px_rgba(212,175,55,0.3)]' : 'inset-0 bg-black'
      }`}
      onClick={handleInteraction}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {!isWidget && (
        <>
          {/* Centered Interaction Text for Mobile & Desktop */}
          <div className="absolute top-[65%] w-full flex flex-col items-center pointer-events-none select-none px-4">
             <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-full border border-pharaonic-gold/20 flex flex-col items-center shadow-2xl shadow-black/50 transform transition-transform duration-500 hover:scale-105">
                <p className="text-[10px] md:text-[12px] font-mono text-pharaonic-gold tracking-[0.3em] uppercase font-bold mb-2 animate-pulse">
                  {state === AgentState.ERROR ? "SYSTEM FAILURE - RETRY" : 
                   (state === AgentState.SPEAKING ? "JUDY IS SPEAKING..." : 
                   (isProcessing ? "CONNECTING SATELLITE..." : 
                   (state === AgentState.LISTENING ? "JUDY IS LISTENING..." : "TAP TO START")))}
                </p>
                <div className="h-1 w-24 md:w-32 bg-pharaonic-gold/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pharaonic-gold transition-all duration-75 ease-out"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
             </div>
             
             {/* Identity Subtext */}
             <div className="mt-8 text-center space-y-3 opacity-60">
                <p className="text-[12px] md:text-[14px] text-white font-serif tracking-widest uppercase">
                  Judy
                </p>
                <div className="flex flex-col gap-1">
                   <p className="text-[9px] text-pharaonic-gold/80 font-mono uppercase tracking-[0.2em]">
                     AlArab Club 777 Host
                   </p>
                </div>
             </div>
          </div>
        </>
      )}

      {isWidget && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[8px] text-pharaonic-gold font-bold font-mono tracking-widest uppercase animate-pulse">
            LIVE
          </p>
        </div>
      )}
    </div>
  );
};
