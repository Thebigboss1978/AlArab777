
import React, { useState } from 'react';
import { Search, Wand2, ArrowRight } from 'lucide-react';
import { Hotel } from '../types';

interface Props {
  onGenerate: (hotel: Hotel) => void;
}

export const HotelGenerator: React.FC<Props> = ({ onGenerate }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);

    // Simulate API delay and scraping
    setTimeout(() => {
      const mockHotel: Hotel = {
        id: Math.random().toString(),
        name: "Sky Pyramids Hotel Inn",
        location: "Nazlet El-Semman, Giza (Pyramids Front)",
        rating: 4.9,
        originalPrice: 3000,
        discountedPrice: 2500,
        imageUrl: "https://picsum.photos/800/600",
        features: ["Pyramid View", "Work Space", "In-House Tours", "Bazaar (Coming Soon)"],
        reviews: 777
      };
      
      onGenerate(mockHotel);
      setLoading(false);
      setUrl('');
    }, 2000);
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-md mb-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">
          Automated Landing Page Generator
        </h2>
        <p className="text-slate-400 text-sm">
          Paste a Google Maps link. Our AI builds the sales page instantly.
        </p>
      </div>

      <form onSubmit={handleSimulate} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://maps.google.com/..." 
            className="block w-full p-4 pl-10 text-sm text-white border border-slate-600 rounded-lg bg-slate-800 focus:ring-pharaonic-gold focus:border-pharaonic-gold placeholder-slate-500"
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="px-6 py-4 bg-pharaonic-gold hover:bg-yellow-600 text-slate-900 font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Wand2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Page
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs text-slate-500">
        <span className="bg-slate-800 px-2 py-1 rounded">Auto-Image Extraction</span>
        <span className="bg-slate-800 px-2 py-1 rounded">Review Analysis</span>
        <span className="bg-slate-800 px-2 py-1 rounded">777 Pricing Engine</span>
      </div>
    </div>
  );
};
