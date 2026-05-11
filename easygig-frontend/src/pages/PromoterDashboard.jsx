import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Music, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  ChevronRight,
  Plus,
  MessageSquare,
  TrendingUp,
  X,
  LayoutGrid
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utility/errorHandler';

import GlobalSearch from '../components/GlobalSearch';
import PhotoGallery from '../components/PhotoGallery';
import * as venueApi from '../api/venues';
import * as bookingApi from '../api/bookings';
import * as profileApi from '../api/profile';
import * as slotApi from '../api/slots';
import NotificationCenter from '../components/NotificationCenter';
import { AlertTriangle } from 'lucide-react';
import UserMenu from '../components/UserMenu';


export default function PromoterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [venues, setVenues] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking Workflow State
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueCalendar, setVenueCalendar] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]); // List of slot objects
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [slotAssignments, setSlotAssignments] = useState({}); // {slotId: bandId}
  const [availableBands, setAvailableBands] = useState([]);
  const [bandSearch, setBandSearch] = useState("");
  
  const [selectedDaySlots, setSelectedDaySlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [allVenues, userGigs, userOrgs] = await Promise.all([
        venueApi.getVenues(),
        bookingApi.getUserBookings(user.id),
        profileApi.getOrganizationsByUser(user.id)
      ]);
      setVenues(allVenues);
      setMyGigs(userGigs);
      setOrganizations(userOrgs);
    } catch (error) {
      console.error("Errore caricamento dashboard promoter:", error);
      alert(getErrorMessage(error, "caricamento della dashboard"));
    }
 finally {
      setIsLoading(false);
    }
  };



  const openVenueDetails = async (venue) => {
    setSelectedVenue(venue);
    try {
      const now = new Date();
      const data = await slotApi.getCalendar(venue.id, now.getMonth() + 1, now.getFullYear());
      setVenueCalendar(data.calendarColors || {});
      setIsBookingModalOpen(true);
    } catch (error) {
      console.error("Errore caricamento calendario locale:", error);
      alert(getErrorMessage(error, "caricamento del calendario"));
    }

  };

  const handleDateClick = async (dateStr) => {
    setSelectedDate(dateStr);
    try {
      const slots = await slotApi.getSlotsByVenueAndDate(selectedVenue.id, dateStr);
      setSelectedDaySlots(slots);
    } catch (error) {
      console.error("Errore recupero slot giornata:", error);
      alert(getErrorMessage(error, "recupero degli slot"));
    }

  };

  const toggleSlotSelection = (slot) => {
    if (selectedSlots.find(s => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const selectFullDay = () => {
    const available = selectedDaySlots.filter(s => s.state === 'AVAILABLE');
    const existingIds = selectedSlots.map(s => s.id);
    const newSlots = available.filter(s => !existingIds.includes(s.id));
    setSelectedSlots([...selectedSlots, ...newSlots]);
  };

  const searchBands = async () => {
    try {
      const data = await profileApi.searchBands({ name: bandSearch });
      setAvailableBands(data);
    } catch (error) {
      console.error("Errore ricerca band:", error);
      alert(getErrorMessage(error, "ricerca della band"));
    }

  };

  const handleCreateBooking = async () => {
    if (selectedSlots.length === 0) return;
    
    const assignments = selectedSlots.map(s => slotAssignments[s.id]);
    if (assignments.some(a => !a)) {
      alert("Assegna una band a ogni slot selezionato.");
      return;
    }

    try {
      await bookingApi.createPromoterBooking({
        promoterId: user.id,
        venueId: selectedVenue.id,
        slotIds: selectedSlots.map(s => s.id),
        bandIds: assignments
      });
      alert("Richiesta di booking multiplo inviata con successo!");
      setIsBookingModalOpen(false);
      setSelectedSlots([]);
      setSlotAssignments({});
      fetchInitialData();
    } catch (error) {
      console.error("Errore creazione booking promoter:", error);
      alert(getErrorMessage(error, "creazione del booking"));
    }

  };

  if (isLoading) return <div className="min-h-screen bg-easygig-dark flex items-center justify-center"><Loader2 className="animate-spin text-easygig-accent" size={48} /></div>;

  return (
    <div className="min-h-screen bg-easygig-dark text-white p-8 font-sans selection:bg-easygig-accent/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        <PromoterHeader user={user} navigate={navigate} />

        <div className="mb-12">
          <GlobalSearch />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard 
            label="Eventi Organizzati" 
            value={myGigs.filter(g => g.status === 'ACCEPTED').length} 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            trend="Totale confermati"
          />
          <StatsCard 
            label="In Attesa" 
            value={myGigs.filter(g => g.status === 'PENDING').length} 
            icon={<Clock className="text-amber-500" />} 
            trend="Proposte attive"
          />
          <StatsCard 
            label="Band nel Roster" 
            value={organizations[0]?.bandsCount || "12"} 
            icon={<Music className="text-easygig-accent" />} 
            trend="Artisti gestiti"
          />
          <StatsCard 
            label="Strike" 
            value={`${user?.strikes || 0}/5`} 
            icon={<AlertTriangle className={user?.strikes > 0 ? "text-rose-500" : "text-slate-500"} />} 
            trend={user?.strikes >= 4 ? "Ban Imminente" : "Account Safe"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main: Organizza Eventi */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-easygig-card p-8 rounded-5xl border border-white/5 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <div className="bg-easygig-accent/20 p-2 rounded-xl text-easygig-accent">
                    <Plus size={20} />
                  </div>
                  Organizza Nuovo Evento
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venues.map(venue => (
                  <div key={venue.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg group-hover:text-easygig-accent transition-colors">{venue.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                          <MapPin size={10} /> {venue.address?.city?.name}
                        </p>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl text-[10px] font-bold">
                        {venue.capacity} PAX
                      </div>
                    </div>
                    <button 
                      onClick={() => openVenueDetails(venue)}
                      className="w-full bg-easygig-accent/10 hover:bg-easygig-accent text-easygig-accent hover:text-white font-bold text-[10px] uppercase py-3 rounded-xl transition-all"
                    >
                      Vedi Disponibilità
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Galleria Organizzazione */}
            {organizations.length > 0 && (
              <PhotoGallery type="ORG" id={organizations[0].id} />
            )}

            {/* I Miei Eventi */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-3 uppercase tracking-tight">
                <Calendar className="text-easygig-accent" /> I Miei Eventi
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {myGigs.length === 0 ? (
                  <div className="bg-slate-900/50 border border-white/5 p-12 rounded-[2.5rem] text-center text-slate-500 italic">
                    Nessun evento organizzato al momento. Inizia a cercare un locale!
                  </div>
                ) : (
                  myGigs.map(gig => (
                    <div key={gig.bookingId} className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl ${gig.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {gig.status === 'ACCEPTED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-lg uppercase">Locale ID: {gig.venueId}</p>
                          <p className="text-xs text-slate-400">Band ID: {gig.bandId} • {gig.slotStart && format(new Date(gig.slotStart), 'dd MMMM yyyy', { locale: it })}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${gig.status === 'ACCEPTED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'}`}>
                          {gig.status}
                        </span>
                        <button className="text-easygig-accent text-[10px] font-bold mt-2 hover:underline tracking-widest">DETTAGLI</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar: Statistiche / Quick Actions */}
          <div className="lg:col-span-4 space-y-8">
             <section className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-tight">Focus Organizzatore</h3>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Band Associate</p>
                    <p className="text-2xl font-black">12</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Città Operative</p>
                    <p className="text-2xl font-black">4</p>
                  </div>
                </div>
             </section>

             <section className="bg-easygig-accent/10 border border-easygig-accent/20 p-8 rounded-[3rem] space-y-4">
                <p className="text-sm font-bold text-easygig-accent italic">"Un vero promoter non organizza serate, crea esperienze indimenticabili."</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">- EasyGig Pro Tips</p>
             </section>
          </div>
        </div>
      </div>

      {/* Modal: Organizza Booking Multiplo */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Organizza Evento: {selectedVenue?.name}</h3>
                <p className="text-slate-400 text-sm">Seleziona i giorni e gestisci gli slot (singoli o giornata intera).</p>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Calendar Day Selection */}
              <div className="space-y-6">
                <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                  <Calendar size={16} /> Disponibilità
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.keys(venueCalendar).map(date => (
                    <button 
                      key={date}
                      onClick={() => handleDateClick(date)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedDate === date ? 'bg-easygig-accent border-easygig-accent' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                      <p className="font-bold text-sm">{format(new Date(date), 'EEEE dd MMMM', { locale: it })}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${venueCalendar[date] === 'green' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                         <span className="text-[10px] uppercase font-bold text-slate-400">{venueCalendar[date] === 'green' ? 'Disponibile' : 'In attesa'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle: Slot Detail for selected day */}
              <div className="space-y-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                  <LayoutGrid size={16} /> Slot del Giorno
                </h4>
                {selectedDate ? (
                  <div className="space-y-4">
                    <button 
                      onClick={selectFullDay}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                    >
                      Seleziona Intera Giornata
                    </button>
                    
                    <div className="space-y-3">
                      {selectedDaySlots.map(slot => (
                        <div 
                          key={slot.id} 
                          onClick={() => toggleSlotSelection(slot)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedSlots.find(s => s.id === slot.id) ? 'bg-easygig-accent border-easygig-accent' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs uppercase">{format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}</span>
                            {selectedSlots.find(s => s.id === slot.id) && <CheckCircle2 size={14} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic text-center py-12">Seleziona un giorno a sinistra.</p>
                )}
              </div>

              {/* Right: Band Assignment for selected slots */}
              <div className="space-y-6">
                <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                  <Music size={16} /> Assegnazione Band
                </h4>
                {selectedSlots.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">Seleziona gli slot per procedere.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedSlots.map(slot => (
                      <div key={slot.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                        <p className="text-[10px] font-black uppercase text-easygig-accent">
                          {format(new Date(slot.start), 'dd MMM')} @ {format(new Date(slot.start), 'HH:mm')}
                        </p>
                        
                        {slotAssignments[slot.id] ? (
                          <div className="flex items-center justify-between bg-emerald-500/10 p-2 rounded-xl">
                            <span className="font-bold text-[10px]">ID: {slotAssignments[slot.id]}</span>
                            <button onClick={() => setSlotAssignments({...slotAssignments, [slot.id]: null})} className="text-rose-500"><X size={14} /></button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Cerca band..." 
                                value={bandSearch}
                                onChange={(e) => setBandSearch(e.target.value)}
                                className="flex-1 bg-slate-800 border border-white/5 rounded-lg py-1.5 px-3 text-[10px]"
                              />
                              <button onClick={searchBands} className="bg-white/5 p-1.5 rounded-lg"><Search size={14} /></button>
                            </div>
                            <div className="max-h-24 overflow-y-auto space-y-1">
                              {availableBands.map(band => (
                                <div 
                                  key={band.id} 
                                  onClick={() => setSlotAssignments({...slotAssignments, [slot.id]: band.id})}
                                  className="p-1.5 hover:bg-easygig-accent/20 rounded-lg text-[10px] cursor-pointer"
                                >
                                  {band.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-slate-900 flex gap-4">
               <button 
                 onClick={() => setIsBookingModalOpen(false)}
                 className="flex-1 bg-white/5 font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
               >
                 Annulla
               </button>
               <button 
                 onClick={handleCreateBooking}
                 disabled={selectedSlots.length === 0}
                 className="flex-[2] bg-easygig-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
               >
                 Invia Proposta {selectedSlots.length > 1 ? 'Multipla' : ''}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function PromoterHeader({ user, navigate }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-easygig-card/40 p-8 rounded-5xl border border-white/5 backdrop-blur-xl shadow-2xl">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-premium p-2 rounded-xl text-white">
            <Briefcase size={20} />
          </div>
          <span className="text-easygig-accent font-black uppercase tracking-widest text-[10px]">Area Promoter Professionista</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Dashboard Organizzatore</h1>
        <p className="text-slate-500 mt-2 font-medium">Gestisci la programmazione per i tuoi locali e band associate.</p>
      </div>

      <div className="flex items-center gap-4">
        <NotificationCenter userId={user?.id} />
        <UserMenu />
        <button 
          onClick={() => navigate('/messages')}

          className="bg-white text-slate-950 hover:bg-easygig-accent hover:text-white px-8 py-5 rounded-3xl flex items-center gap-4 transition-all group font-black uppercase tracking-widest shadow-2xl active:scale-95 border-b-4 border-slate-200 hover:border-indigo-600"
        >
          <MessageSquare className="group-hover:rotate-12 transition-transform" />
          Messaggi
        </button>
      </div>
    </header>
  );
}


function StatsCard({ label, value, icon, trend }) {
  return (
    <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl group hover:border-easygig-accent/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{trend}</span>
      </div>
      <div>
        <p className="text-3xl font-black tracking-tight">{value}</p>
        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}

