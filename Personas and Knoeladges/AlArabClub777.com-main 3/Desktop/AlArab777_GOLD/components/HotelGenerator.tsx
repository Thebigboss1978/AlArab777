
import React, { useState, useRef, useEffect } from 'react';
import { Search, Wand2, Globe, Database, Unlock, DollarSign, Terminal, Server, Wifi } from 'lucide-react';
import { Hotel } from '../types';
import { searchLivePrice } from '../services/geminiService';

interface Props {
  onGenerate: (hotel: Hotel) => void;
}

export const HotelGenerator: React.FC<Props> = ({ onGenerate }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setLogs([]); 

    // 1. INITIALIZE TUNNEL
    addLog("Initializing Tunnel 777...");
    await new Promise(r => setTimeout(r, 800));
    
    // 2. LIVE FETCH FROM WEB
    addLog(`Connecting to LIVE Web Index (Searching: ${query})...`);
    
    try {
        // REAL CALL TO GEMINI
        const liveData = await searchLivePrice(query);
        
        addLog("Data Stream Acquired.");
        await new Promise(r => setTimeout(r, 600));
        
        addLog(`Target Found: ${liveData.name}`);
        addLog(`LIVE MARKET RATE: EGP ${liveData.price.toLocaleString()}`);

        // 3. APPLY 777 LOGIC
        const bookingPrice = liveData.price;
        const commissionRate = 0.15; // 15% Standard Fee
        const commissionValue = Math.floor(bookingPrice * commissionRate);
        const netPrice = bookingPrice - commissionValue; 

        await new Promise(r => setTimeout(r, 800));
        addLog(`DETECTED COMMISSION (15%): - EGP ${commissionValue}`);
        
        await new Promise(r => setTimeout(r, 800));
        addLog("BYPASSING AGENT FEES...");
        addLog("Applying '777 Direct' Protocol...");
        
        await new Promise(r => setTimeout(r, 800));
        addLog(`FINAL NET PRICE: EGP ${netPrice.toLocaleString()}`);
        addLog("Generating Interface...");

        // Final Result
        setTimeout(() => {
            const mockHotel: Hotel = {
                id: Math.random().toString(),
                name: liveData.name,
                location: "Nazlet El-Semman, Giza",
                rating: 4.9,
                originalPrice: bookingPrice, // Real Web Price
                discountedPrice: netPrice,   // 777 Price
                imageUrl: "https://images.unsplash.com/photo-1560130958-b0a681c62d08?q=80&w=1000&auto=format&fit=crop",
                features: [...liveData.features, "No Commission", "Direct Booking"],
                reviews: 888
            };
            
            onGenerate(mockHotel);
            setLoading(false);
            setQuery('');
            setLogs([]);
        }, 1000);

    } catch (err) {
        addLog("Connection Interrupted. Using backup frequency.");
        setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 p-6 rounded-2xl border border-pharaonic-gold/20 backdrop-blur-md mb-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Wifi className="w-6 h-6 text-green-500 animate-pulse" />
          Live Price Scanner
        </h2>
        <p className="text-slate-400 text-xs font-mono tracking-wide uppercase">
          Scanning Global Travel Indexes (Real-Time)
        </p>
      </div>

      <form onSubmit={handleSimulate} className="flex flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Globe className="w-5 h-5 text-slate-500" />
          </div>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Hotel Name (e.g., Sky Pyramids)..." 
            className="block w-full p-4 pl-10 text-sm text-white border border-slate-600 rounded-lg bg-black/50 focus:ring-pharaonic-gold focus:border-pharaonic-gold placeholder-slate-600 font-mono"
            disabled={loading}
          />
        </div>

        {/* LOG TERMINAL */}
        {loading && (
          <div 
            ref={logContainerRef}
            className="h-40 bg-black border border-green-900/50 rounded-lg p-3 overflow-y-auto font-mono text-[10px] text-green-500 shadow-inner"
          >
            {logs.map((log, i) => (
              <div key={i} className={`mb-1 animate-in fade-in slide-in-from-left-2 duration-300 ${log.includes("COMMISSION") ? 'text-red-500 font-bold' : log.includes("NET PRICE") ? 'text-pharaonic-gold font-bold text-sm' : ''}`}>
                {log}
              </div>
            ))}
            <div className="animate-pulse">_</div>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className={`px-6 py-4 font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            loading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-pharaonic-gold hover:bg-yellow-600 text-slate-900 hover:scale-[1.02]'
          }`}
        >
          {loading ? (
            <>
              <Server className="w-5 h-5 animate-pulse" />
              Fetching Live Data...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Scan Live Market
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest">
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3" /> Live Connection
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" /> 777 Bypass Active
        </span>
      </div>
    </div>
  );
};
