import React from 'react';

interface Hotel {
  name: string;
  price: string;
  view: string;
  amenities: string[];
}

export const HotelCard: React.FC<{ hotel: Hotel }> = ({ hotel }) => {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md group hover:border-purple-500/50 transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{hotel.name}</h3>
        <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">{hotel.price}</span>
      </div>
      <p className="text-[10px] text-white/50 mb-3 italic">"{hotel.view}"</p>
      <div className="flex flex-wrap gap-1">
        {hotel.amenities.map(a => (
          <span key={a} className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-white/30 uppercase">{a}</span>
        ))}
      </div>
    </div>
  );
};
