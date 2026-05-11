import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Star, 
  ChevronLeft, 
  Loader2, 
  Calendar,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import * as profileApi from '../api/profile';
import PhotoGallery from '../components/PhotoGallery';

export default function PromoterDetail() {
  const { promoterId } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await profileApi.getOrganizationById(promoterId);
        setOrg(data);
      } catch (error) {
        console.error("Errore recupero dettagli promoter:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [promoterId]);

  if (isLoading) return <div className="min-h-screen bg-easygig-dark flex items-center justify-center"><Loader2 className="animate-spin text-easygig-accent" size={48} /></div>;
  if (!org) return <div className="min-h-screen bg-easygig-dark text-white flex items-center justify-center">Organizzazione non trovata.</div>;

  return (
    <div className="min-h-screen bg-easygig-dark text-white font-sans">
      
      {/* Hero Section */}
      <div className="relative h-[450px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-easygig-dark via-easygig-dark/40 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2000" 
          alt={org.name}
          className="w-full h-full object-cover grayscale opacity-50"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-all">
            <ChevronLeft size={20} /> Torna alla ricerca
          </button>
          <div className="flex items-center gap-4 mb-2">
            <span className="bg-easygig-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{org.type}</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              <Star size={14} className="fill-amber-400" /> {org.reputation || "5.0"}
            </div>
          </div>
          <h1 className="text-7xl font-black tracking-tighter uppercase">{org.name}</h1>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <MapPin size={20} className="text-easygig-accent" /> {org.city?.name || "Internazionale"}
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-bold uppercase text-xs tracking-widest">
               <Briefcase size={20} className="text-easygig-accent" /> Professional Booking Organization
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Bio & Events */}
        <div className="lg:col-span-8 space-y-12">
          
          <section className="bg-slate-900 border border-white/5 p-10 rounded-[3rem]">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Mission & Vision</h3>
            <p className="text-slate-400 leading-relaxed text-lg italic">
              "{org.description || "Questa organizzazione si occupa di connettere i migliori talenti con i palchi più prestigiosi del mondo."}"
            </p>
          </section>

          {/* Event History */}
          <section className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <Calendar className="text-easygig-accent" /> Storico Eventi
            </h3>
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
               <p className="text-slate-400 leading-relaxed">
                 {org.eventsHistory || "Nessun evento registrato ufficialmente al momento."}
               </p>
            </div>
          </section>

          {/* Galleria */}
          <PhotoGallery type="ORG" id={promoterId} />

        </div>

        {/* Sidebar: Promoter Details */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-slate-900 border border-white/10 p-8 rounded-[4rem] space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-500"><TrendingUp /></div>
                   <div>
                     <p className="text-[10px] uppercase text-slate-500 font-bold">Eventi Organizzati</p>
                     <p className="font-black text-xl">150+</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="bg-purple-500/10 p-4 rounded-2xl text-purple-500"><Award /></div>
                   <div>
                     <p className="text-[10px] uppercase text-slate-500 font-bold">Affidabilità</p>
                     <p className="font-black text-xl text-emerald-500">Massima</p>
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Partita IVA / Tax ID</p>
                <p className="font-mono text-xs text-slate-400">{org.partitaIva || "Verificata"}</p>
              </div>

              <button className="w-full bg-easygig-accent text-white font-black py-5 rounded-3xl uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20">
                Propone una Band
              </button>
           </section>

           <div className="p-8 bg-slate-900 border border-white/5 rounded-[3rem] text-center space-y-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Contatti Verificati</p>
              <div className="flex justify-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-easygig-accent transition-colors cursor-pointer">
                    <Briefcase size={16} />
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-easygig-accent transition-colors cursor-pointer">
                    <Users size={16} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
