import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Music, 
  Briefcase, 
  ArrowRight, 
  Loader2, 
  X, 
  SlidersHorizontal,
  Users,
  Euro,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as profileApi from '../api/profile';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("VENUE"); // VENUE, BAND, PROMOTER
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    city: "",
    genre: "",
    minCapacity: "",
    maxCapacity: "",
    maxCachet: "",
    minReputation: 0
  });

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      let data = [];
      const params = { name: query, ...filters };
      
      // Clean empty filters
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      if (type === "VENUE") data = await profileApi.searchVenues(params);
      else if (type === "BAND") data = await profileApi.searchBands(params);
      else if (type === "PROMOTER") data = await profileApi.searchOrganizations(params);
      setResults(data);
    } catch (error) {
      console.error("Errore ricerca globale:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const getDetailLink = (item) => {
    if (type === "VENUE") return `/venue/${item.id}`;
    if (type === "BAND") return `/band/${item.id}`;
    if (type === "PROMOTER") return `/promoter/${item.id}`;
    return "/";
  };

  const resetFilters = () => {
    setFilters({
      city: "",
      genre: "",
      minCapacity: "",
      maxCapacity: "",
      maxCachet: "",
      minReputation: 0
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Bar & Primary Actions */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder={`Cerca per nome...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-transparent py-5 pl-16 pr-6 outline-none text-lg font-medium"
          />
        </div>
        
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
          {['VENUE', 'BAND', 'PROMOTER'].map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setResults([]); setHasSearched(false); resetFilters(); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-easygig-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {t === 'VENUE' ? 'Locali' : t === 'BAND' ? 'Artisti' : 'Promoter'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 rounded-2xl border transition-all ${showFilters ? 'bg-easygig-accent border-easygig-accent text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
          >
            <SlidersHorizontal size={24} />
          </button>
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-easygig-accent hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : "Cerca"}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-down">
          
          {/* City Filter */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
              <MapPin size={12} /> Città
            </label>
            <input 
              type="text" 
              placeholder="Es. Roma, Milano..."
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-easygig-accent text-sm"
            />
          </div>

          {/* Type Specific Filters */}
          {type === 'VENUE' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                  <Users size={12} /> Capienza Min
                </label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={filters.minCapacity}
                  onChange={(e) => setFilters({...filters, minCapacity: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                  <Users size={12} /> Capienza Max
                </label>
                <input 
                  type="number" 
                  placeholder="5000+"
                  value={filters.maxCapacity}
                  onChange={(e) => setFilters({...filters, maxCapacity: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none text-sm"
                />
              </div>
            </>
          )}

          {type === 'BAND' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                  <Music size={12} /> Genere
                </label>
                <input 
                  type="text" 
                  placeholder="Rock, Jazz, Pop..."
                  value={filters.genre}
                  onChange={(e) => setFilters({...filters, genre: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                  <Euro size={12} /> Cachet Max (€)
                </label>
                <input 
                  type="number" 
                  placeholder="Budget massimo..."
                  value={filters.maxCachet}
                  onChange={(e) => setFilters({...filters, maxCachet: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none text-sm"
                />
              </div>
            </>
          )}

          {/* Reputation Filter (Global) */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
              <Star size={12} /> Reputazione Min
            </label>
            <div className="flex items-center gap-2">
               <input 
                 type="range" 
                 min="0" 
                 max="5" 
                 step="0.5"
                 value={filters.minReputation}
                 onChange={(e) => setFilters({...filters, minReputation: e.target.value})}
                 className="flex-1 accent-easygig-accent"
               />
               <span className="font-bold text-easygig-accent w-8 text-center">{filters.minReputation}</span>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end">
             <button onClick={resetFilters} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">
               Resetta Filtri
             </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div className="animate-fade-in space-y-4">
          <div className="flex justify-between items-center px-4">
             <p className="text-slate-500 text-sm">Trovati <span className="text-white font-bold">{results.length}</span> risultati</p>
             <button onClick={() => { setResults([]); setHasSearched(false); setQuery(""); resetFilters(); }} className="text-slate-500 hover:text-white flex items-center gap-1 text-xs">
               <X size={14} /> Pulisci
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(results) ? results : []).map(item => (
              <div 
                key={item.id} 
                onClick={() => navigate(getDetailLink(item))}
                className="bg-slate-900 border border-white/5 p-6 rounded-3xl hover:bg-white/5 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.profilePhoto ? (
                      <img src={item.profilePhoto} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-easygig-accent">
                        {type === 'VENUE' ? <MapPin /> : type === 'BAND' ? <Music /> : <Briefcase />}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-easygig-accent transition-colors">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} /> {item.cityName || item.city?.name || (type === 'BAND' ? item.primaryGenre : 'Internazionale')}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                        <Star size={10} className="fill-amber-500" /> {item.reputation || "5.0"}
                      </div>
                    </div>
                  </div>
                </div>
                <ArrowRight className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>

          {results.length === 0 && !isSearching && (
            <div className="bg-white/5 border border-dashed border-white/10 p-12 rounded-[3rem] text-center">
              <p className="text-slate-500">Nessun risultato trovato. Prova a modificare i filtri!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
