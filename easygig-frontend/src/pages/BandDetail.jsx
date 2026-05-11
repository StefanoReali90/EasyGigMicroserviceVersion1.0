import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Music, 
  MapPin, 
  Star, 
  ChevronLeft, 
  Loader2, 
  Clock, 
  Play, 
  Users,
  Award,
  Calendar,
  Share2
} from 'lucide-react';
import * as profileApi from '../api/profile';
import * as trackApi from '../api/tracks';
import { usePlayerStore } from '../store/playerStore';
import PhotoGallery from '../components/PhotoGallery';

export default function BandDetail() {
  const { bandId } = useParams();
  const navigate = useNavigate();
  const play = usePlayerStore(state => state.play);

  const [band, setBand] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bandData, trackData] = await Promise.all([
          profileApi.getBandById(bandId),
          trackApi.getBandTracks(bandId)
        ]);
        setBand(bandData);
        setTracks(trackData);
      } catch (error) {
        console.error("Errore recupero dettagli band:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [bandId]);

  if (isLoading) return <div className="min-h-screen bg-easygig-dark flex items-center justify-center"><Loader2 className="animate-spin text-easygig-accent" size={48} /></div>;
  if (!band) return <div className="min-h-screen bg-easygig-dark text-white flex items-center justify-center">Band non trovata.</div>;

  return (
    <div className="min-h-screen bg-easygig-dark text-white font-sans selection:bg-easygig-accent/30 overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="relative h-[450px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-easygig-dark via-easygig-dark/40 to-transparent z-10" />
        <img 
          src={band.profilePhoto || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=2000"} 
          alt={band.name}
          className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Torna alla ricerca
          </button>
          <div className="flex items-center gap-4 mb-3">
            <span className="bg-easygig-accent/20 text-easygig-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-easygig-accent/30 backdrop-blur-md">{band.bandType}</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 backdrop-blur-md">
              <Star size={16} className="fill-amber-400" /> {band.reputation || "5.0"}
            </div>
          </div>
          <h1 className="text-8xl font-black tracking-tighter uppercase leading-[0.85]">{band.name}</h1>
          <div className="flex items-center gap-8 mt-6">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <MapPin size={22} className="text-easygig-accent" /> {band.cityName || "Zona non specificata"}
            </div>
            <div className="flex items-center gap-2 text-slate-200 font-bold uppercase text-xs tracking-widest bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
               <Music size={18} className="text-easygig-accent" /> {band.primaryGenre || "Rock"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Info & Tracks */}
        <div className="lg:col-span-8 space-y-16 animate-slide-up">
          
          {/* Bio */}
          <section className="bg-easygig-card p-12 rounded-5xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-easygig-accent/5 rounded-full blur-3xl group-hover:bg-easygig-accent/10 transition-colors" />
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-8">La nostra Storia</h3>
            <p className="text-slate-300 leading-relaxed text-xl font-medium italic opacity-90">
              "{band.description || "Questa band non ha ancora inserito una biografia. Ma la loro musica parla per loro!"}"
            </p>
          </section>

          {/* Player */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                <Play className="text-easygig-accent" fill="currentColor" size={32} /> Tracks & Demo
              </h3>
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {tracks.length} Brani Disponibili
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {tracks.length === 0 ? (
                <div className="bg-white/[0.02] border border-dashed border-white/10 p-12 rounded-4xl text-center">
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Nessun brano caricato al momento.</p>
                </div>
              ) : (
                tracks.map(track => (
                  <div key={track.id} className="bg-easygig-card border border-white/5 p-5 rounded-4xl flex items-center justify-between group hover:bg-white/[0.05] hover:border-easygig-accent/30 transition-all duration-500">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => play(track)}
                        className="bg-white text-slate-950 p-5 rounded-3xl shadow-xl group-hover:bg-easygig-accent group-hover:text-white transition-all transform active:scale-90"
                      >
                        <Play size={24} fill="currentColor" />
                      </button>
                      <div>
                        <p className="font-black text-lg uppercase tracking-tight">{track.title}</p>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-easygig-accent">Original Track</span>
                           <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                           <span className="text-[10px] font-medium text-slate-500 uppercase">Stereo High Quality</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pr-4">
                       <span className="text-slate-600 text-xs font-mono font-bold tracking-widest uppercase">3:45</span>
                       <button className="text-slate-600 hover:text-white transition-colors"><Share2 size={18} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Galleria */}
          <PhotoGallery type="BAND" id={bandId} />

        </div>

        {/* Sidebar: Details */}
        <div className="lg:col-span-4 space-y-8 animate-fade-in">
           <section className="bg-easygig-card border border-white/5 p-10 rounded-5xl shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-easygig-accent/5 rounded-full blur-3xl" />
              
              <div className="space-y-8 mb-10">
                <div className="flex items-center gap-5">
                   <div className="bg-easygig-accent/10 p-5 rounded-3xl text-easygig-accent shadow-inner"><Users size={28} /></div>
                   <div>
                     <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Formazione</p>
                     <p className="font-black text-2xl tracking-tighter">4 MEMBRI</p>
                   </div>
                </div>
                <div className="flex items-center gap-5">
                   <div className="bg-emerald-500/10 p-5 rounded-3xl text-emerald-500 shadow-inner"><Award size={28} /></div>
                   <div>
                     <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Cachet Estimato</p>
                     <p className="font-black text-2xl tracking-tighter text-emerald-400">€ {band.cachet || "Trattabile"}</p>
                   </div>
                </div>
              </div>

              <button className="w-full bg-gradient-premium text-white font-black py-6 rounded-3xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20">
                Invia Proposta di Ingaggio
              </button>
           </section>

           <div className="p-10 bg-easygig-card border border-white/5 rounded-5xl shadow-2xl relative overflow-hidden group">
              <Calendar className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10">
                <h4 className="font-black uppercase text-xl mb-3 tracking-tighter">Eventi Recenti</h4>
                <div className="space-y-4">
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-xs font-bold mb-1">Live at Blue Note</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">12 Maggio 2026</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

