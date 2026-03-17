
import React from 'react';
import { Hotel } from '../types';
import { MapPin, Star, MessageCircle, Phone } from 'lucide-react';
import { JUDY_SETTINGS } from '../config/judyConfig';

interface Props {
  hotel: Hotel;
}

export const HotelCard: React.FC<Props> = ({ hotel }) => {
  // Pulling contact info from the Central Brain
  const primaryNumber = JUDY_SETTINGS.CONTACT.phone;
  const whatsappNumber = JUDY_SETTINGS.CONTACT.whatsapp;
  
  const handleContact = (method: 'whatsapp' | 'phone') => {
    if (method === 'whatsapp') {
      const message = `Salam Ya Basha! I am interested in ${hotel.name} services (Room/Tours/WorkSpace).`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.location.href = `tel:${primaryNumber}`;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-pharaonic-gold transition-all duration-300 group shadow-lg shadow-black/50">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={hotel.imageUrl} 
          alt={hotel.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-pharaonic-gold text-slate-900 font-bold px-2 py-1 rounded text-xs shadow-md">
          VIP ACCESS
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-bold text-white leading-tight">{hotel.name}</h3>
          <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="ml-1 text-xs font-bold">{hotel.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-slate-400 text-sm mb-4">
          <MapPin className="w-3 h-3 mr-1 text-pharaonic-gold" />
          {hotel.location}
        </div>

        <div className="flex justify-between items-end mb-4 border-t border-slate-800 pt-3">
          <div>
            <span className="block text-xs text-slate-500 line-through">EGP {hotel.originalPrice}</span>
            <span className="block text-lg font-bold text-pharaonic-gold">EGP {hotel.discountedPrice}</span>
          </div>
          <span className="text-xs text-green-400 font-semibold bg-green-900/20 px-2 py-1 rounded">
            Commission Free
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => handleContact('whatsapp')}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button 
            onClick={() => handleContact('phone')}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </button>
        </div>
        <div className="mt-3 text-[10px] text-center text-slate-500 space-y-1">
          <p>Direct Line (The General):</p>
          <p className="font-mono text-slate-400">{primaryNumber}</p>
        </div>
      </div>
    </div>
  );
};
