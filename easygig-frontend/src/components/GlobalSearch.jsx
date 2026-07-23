import { useState, useEffect } from 'react';
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
  Star,
  Command,
  Filter
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
    if (!query && !filters.city && !filters.genre) return;
    
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Search Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-easygig-accent/20 to-purple-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        
        <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-3 rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row gap-4 items-center">
          
          <div className="flex-1 w-full relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-easygig-accent transition-colors" size={24} />
            <input 
              type="text" 
              placeholder={`Cerca ${type === 'VENUE' ? 'locali' : type === 'BAND' ? 'artisti' : 'promoter'}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent py-6 pl-16 pr-6 outline-none text-xl font-bold placeholder:text-slate-600 tracking-tight"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl">
               <Command size={12} className="text-slate-500" />
               <span className="text-[10px] font-black text-slate-500">INVIO</span>
            </div>
          </div>
          
          <div className="flex w-full lg:w-auto items-center gap-2">
            <div className="flex p-1.5 bg-easygig-dark/50 rounded-2xl border border-white/5">
              {['VENUE', 'BAND', 'PROMOTER'].map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); setResults([]); setHasSearched(false); resetFilters(); }}
                  className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-easygig-accent text-white shadow-xl shadow-easygig-accent/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  {t === 'VENUE' ? 'Locali' : t === 'BAND' ? 'Artisti' : 'Promoter'}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-5 rounded-2xl border transition-all ${showFilters ? 'bg-easygig-accent border-easygig-accent text-white shadow-xl shadow-easygig-accent/20' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
            >
              <Filter size={20} />
            </button>
            
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-white text-slate-950 hover:bg-easygig-accent hover:text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="animate-spin" size={20} /> : "Cerca"}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-easygig-card border border-white/5 p-10 rounded-[3rem] shadow-2xl animate-slide-up grid grid-cols-1 md:grid-cols-4 gap-8">
          <FilterInput label="Città" icon={<MapPin size={14} />} value={filters.city} onChange={(v) => setFilters({...filters, city: v})} placeholder="Es. Milano" />
          
          {type === 'VENUE' && (
            <>
              <FilterInput label="Capienza Min" icon={<Users size={14} />} type="number" value={filters.minCapacity} onChange={(v) => setFilters({...filters, minCapacity: v})} placeholder="0" />
              <FilterInput label="Capienza Max" icon={<Users size={14} />} type="number" value={filters.maxCapacity} onChange={(v) => setFilters({...filters, maxCapacity: v})} placeholder="500+" />
            </>
          )}

          {type === 'BAND' && (
            <>
              <FilterInput label="Genere" icon={<Music size={14} />} value={filters.genre} onChange={(v) => setFilters({...filters, genre: v})} placeholder="Es. Rock" />
              <FilterInput label="Cachet Max (€)" icon={<Euro size={14} />} type="number" value={filters.maxCachet} onChange={(v) => setFilters({...filters, maxCachet: v})} placeholder="Budget" />
            </>
          )}

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
              <Star size={12} /> Rating: {filters.minReputation}+
            </label>
            <input 
              type="range" min="0" max="5" step="0.5"
              value={filters.minReputation}
              onChange={(e) => setFilters({...filters, minReputation: e.target.value})}
              className="w-full accent-easygig-accent"
            />
          </div>

          <div className="md:col-span-4 flex justify-between items-center pt-6 border-t border-white/5">
             <button onClick={resetFilters} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Resetta Filtri</button>
             <p className="text-[10px] text-slate-600 font-bold uppercase italic">Filtri avanzati attivi</p>
          </div>
        </div>
      )}

      {/* Results Container */}
      <div className="min-h-[200px] space-y-6">
        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : hasSearched ? (
          <>
            <div className="flex justify-between items-center px-4">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Risultati per {type}: <span className="text-white">{results.length}</span></p>
               <button onClick={() => { setResults([]); setHasSearched(false); setQuery(""); }} className="text-slate-500 hover:text-rose-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
                 <X size={14} /> Pulisci Ricerca
               </button>
            </div>
            
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {results.map(item => (
                  <ResultCard key={item.id} item={item} type={type} onClick={() => navigate(getDetailLink(item))} />
                ))}
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-dashed border-white/10 p-20 rounded-[4rem] text-center">
                 <Search className="mx-auto text-slate-800 mb-6" size={48} />
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Nessun match trovato</p>
                 <p className="text-slate-700 text-xs mt-2">Prova a cambiare i parametri o ad ampliare la zona di ricerca.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 opacity-30">
             <Command size={64} className="mx-auto text-slate-500 mb-6" />
             <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs leading-relaxed">Digita e premi invio per esplorare<br/>la scena musicale professionale</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterInput({ label, icon, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 outline-none focus:ring-1 focus:ring-easygig-accent text-sm font-medium transition-all"
      />
    </div>
  );
}

function ResultCard({ item, type, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group bg-easygig-card border border-white/5 p-8 rounded-[3rem] hover:bg-white/[0.04] hover:border-easygig-accent/30 transition-all cursor-pointer relative overflow-hidden flex items-center gap-6 shadow-xl"
    >
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
        <ArrowRight className="text-easygig-accent" />
      </div>

      <div className="w-24 h-24 rounded-[2rem] overflow-hidden border border-white/10 bg-easygig-dark flex-shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-2xl">
        {item.profilePhoto ? (
          <img src={item.profilePhoto} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-easygig-accent/40 bg-easygig-accent/5">
            {type === 'VENUE' ? <MapPin size={32} /> : type === 'BAND' ? <Music size={32} /> : <Briefcase size={32} />}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-black text-xl text-white truncate tracking-tighter uppercase">{item.name}</h4>
          {item.verified && <CheckCircle2 size={14} className="text-easygig-accent" />}
        </div>
        
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-tight">
            <MapPin size={12} className="text-easygig-accent" /> {item.cityName || item.city?.name || 'Internazionale'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-black">
            <Star size={12} className="fill-amber-500" /> {item.reputation || "5.0"}
          </div>
          {type === 'BAND' && item.primaryGenre && (
            <div className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] text-slate-500 font-bold uppercase tracking-widest border border-white/5">
              {item.primaryGenre}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-easygig-card border border-white/5 p-8 rounded-[3rem] animate-pulse flex items-center gap-6">
      <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-white/5 rounded-full w-3/4" />
        <div className="h-4 bg-white/5 rounded-full w-1/2" />
        <div className="flex gap-2">
           <div className="h-3 bg-white/5 rounded-full w-12" />
           <div className="h-3 bg-white/5 rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}
