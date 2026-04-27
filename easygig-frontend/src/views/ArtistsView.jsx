import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Music, MapPin, Star, MoreVertical } from 'lucide-react';

const ArtistsView = () => {
  const [bands, setBands] = useState([]);

  useEffect(() => {
    api.bands.list().then(setBands).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Artists & Bands</h1>
        <p className="text-slate-500 mt-1">Manage the performers in your network.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bands.length > 0 ? bands.map(band => (
          <div key={band.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all group">
            <div className="h-40 bg-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              {band.imagePath && <img src={band.imagePath} alt={band.name} className="w-full h-full object-cover" />}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                 <div className="bg-indigo-600 px-2 py-1 rounded text-[10px] font-bold uppercase text-white">
                   {band.genre || 'Rock'}
                 </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{band.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <MapPin size={14} />
                    <span>{band.cityName || 'Italy'}</span>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-white">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Reputation</p>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="font-bold">{band.reputation || '5.0'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Shows</p>
                  <p className="text-white font-bold">{band.reviewCount || '0'}</p>
                </div>
              </div>

              <button className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-indigo-600 rounded-xl text-sm font-bold text-white transition-all">
                View Profile
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-500">
            No artists found. Start by registering an artist through the API.
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsView;
