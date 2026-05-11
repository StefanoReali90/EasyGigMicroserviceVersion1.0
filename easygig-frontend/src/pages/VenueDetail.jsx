import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  Music, 
  MapPin, 
  Calendar, 
  Users, 
  Info, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Phone,
  Settings
} from 'lucide-react';
import * as profileApi from '../api/profile';
import * as bookingApi from '../api/bookings';
import PhotoGallery from '../components/PhotoGallery';

export default function VenueDetail() {
  const { venueId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Selection
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueData, slotData] = await Promise.all([
          profileApi.getVenueById(venueId),
          bookingApi.getSlotsByVenue(venueId)
        ]);
        setVenue(venueData);
        setSlots(slotData);
      } catch (error) {
        console.error("Errore recupero dettagli locale:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [venueId]);

  const handleRequestBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      await bookingApi.createRequest({
        userId: user.id,
        slotId: selectedSlot.id
      });
      alert("Richiesta inviata con successo! Verrai contattato se il locale accetta.");
      // Refresh slots
      const updatedSlots = await bookingApi.getSlotsByVenue(venueId);
      setSlots(updatedSlots);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Errore invio richiesta:", error);
      alert(error.response?.data?.message || "Errore durante l'invio della richiesta.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-easygig-dark flex items-center justify-center"><Loader2 className="animate-spin text-easygig-accent" size={48} /></div>;
  if (!venue) return <div className="min-h-screen bg-easygig-dark text-white flex items-center justify-center">Locale non trovato.</div>;

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="min-h-screen bg-easygig-dark text-white font-sans selection:bg-easygig-accent/30">
      
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-easygig-dark via-easygig-dark/20 to-transparent z-10" />
        <img 
          src={venue.profilePhoto || "https://images.unsplash.com/photo-1514525253361-bee0474859bc?auto=format&fit=crop&q=80&w=2000"} 
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Torna alla ricerca
          </button>
          <div className="flex items-center gap-4 mb-3">
             <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 backdrop-blur-md">
               <Star size={16} className="fill-amber-400" /> {venue.reputation || "5.0"}
             </div>
             <span className="bg-easygig-accent/20 text-easygig-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-easygig-accent/30 backdrop-blur-md">Locale Verificato</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">{venue.name}</h1>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <MapPin size={22} className="text-easygig-accent" /> {venue.address?.city?.name || "Zona non specificata"}
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-medium">
               <Users size={20} className="text-easygig-accent" /> {venue.capacity || "N/A"} PAX
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Info Locale */}
        <div className="lg:col-span-4 space-y-8 animate-fade-in">
          <section className="bg-easygig-card border border-white/5 p-10 rounded-5xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-easygig-accent/5 rounded-full blur-3xl group-hover:bg-easygig-accent/10 transition-colors" />
            
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-8">
              <Info className="text-easygig-accent" /> Dettagli Tecnici
            </h3>
            
            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2">Descrizione</p>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{venue.description || "Un locale accogliente pronto ad ospitare i migliori talenti della scena musicale."}"
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="bg-easygig-accent/10 p-3 rounded-xl text-easygig-accent"><Phone size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-tighter">Contatto Diretto</p>
                    <p className="font-bold text-sm">{venue.phone || "Non disponibile"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500"><Settings size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-tighter">Backline & Service</p>
                    <p className="font-bold text-sm truncate max-w-[180px]">{venue.equipment || "Standard Service"}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-gradient-premium p-10 rounded-5xl shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <Music className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
            <h4 className="text-white font-black uppercase text-2xl mb-4 leading-none">Prenota il tuo Slot</h4>
            <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">
              Scegli una data, invia la tua proposta e carica i tuoi migliori brani. La musica dal vivo parte da qui.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
               Fast Response
            </div>
          </div>
        </div>

        {/* Calendario Slot */}
        <div className="lg:col-span-8 space-y-12 animate-slide-up">
          <div className="bg-easygig-card border border-white/5 rounded-5xl p-8 lg:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Disponibilità Live</h3>
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-1.5 border border-white/5 backdrop-blur-sm">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft size={20}/></button>
                <span className="font-black text-xs min-w-[140px] text-center uppercase tracking-[0.2em]">{format(currentMonth, 'MMMM yyyy', { locale: it })}</span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><ChevronRight size={20}/></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-12">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
                <div key={d} className="text-center text-[10px] font-black uppercase text-slate-600 tracking-widest pb-4">{d}</div>
              ))}
              {days.map(day => {
                const daySlots = slots.filter(s => isSameDay(new Date(s.start), day));
                const isAvailable = daySlots.some(s => s.state === 'AVAILABLE');
                const isPending = daySlots.some(s => s.state === 'PENDING');
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={day.toString()} className="aspect-square relative flex flex-col items-center justify-center group/day">
                    <span className={`text-sm font-black transition-all ${isToday ? 'bg-easygig-accent text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg shadow-easygig-accent/30' : 'text-slate-400 group-hover/day:text-white'}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {isAvailable ? (
                      <div className="mt-3 flex gap-1.5">
                        {daySlots.filter(s => s.state === 'AVAILABLE').map(s => (
                          <button 
                            key={s.id}
                            onClick={() => setSelectedSlot(s)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedSlot?.id === s.id ? 'bg-easygig-accent scale-150 ring-4 ring-easygig-accent/20' : 'bg-emerald-500/80 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20 hover:scale-125'}`}
                            title={`Slot Disponibile: ${format(new Date(s.start), 'HH:mm')}`}
                          />
                        ))}
                      </div>
                    ) : isPending ? (
                      <div className="mt-3 w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50" />
                    ) : (
                      <div className="mt-3 w-2.5 h-2.5 rounded-full bg-white/5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Azione di Prenotazione */}
            <div className="pt-10 border-t border-white/5">
              {selectedSlot ? (
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in bg-white/5 p-8 rounded-4xl border border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-premium rounded-3xl flex items-center justify-center text-white shadow-xl">
                      <Clock size={32} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Hai selezionato lo slot</p>
                      <p className="text-2xl font-black uppercase tracking-tight">{format(new Date(selectedSlot.start), 'EEEE dd MMMM', { locale: it })}</p>
                      <p className="text-sm text-slate-400 font-medium">Ore {format(new Date(selectedSlot.start), 'HH:mm')} — {format(new Date(selectedSlot.end), 'HH:mm')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRequestBooking}
                    disabled={isBooking}
                    className="w-full md:w-auto bg-white text-slate-950 hover:bg-easygig-accent hover:text-white disabled:opacity-50 px-12 py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isBooking ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={24} /> Invia Candidatura</>}
                  </button>
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-dashed border-white/10 p-12 rounded-4xl text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-slate-600" size={32} />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Seleziona uno slot verde sul calendario</p>
                </div>
              )}
            </div>
          </div>

          <PhotoGallery type="VENUE" id={venueId} />
        </div>
      </div>
    </div>
  );
}

