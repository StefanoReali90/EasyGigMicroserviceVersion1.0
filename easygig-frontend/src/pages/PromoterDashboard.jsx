import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Calendar, 
  Music, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Plus,
  MessageSquare,
  TrendingUp,
  X,
  LayoutGrid,
  Award,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utility/errorHandler';
import { useToast } from '../context/ToastContext';

import GlobalSearch from '../components/GlobalSearch';
import * as venueApi from '../api/venues';
import * as bookingApi from '../api/bookings';
import * as profileApi from '../api/profile';
import * as slotApi from '../api/slots';
import NotificationCenter from '../components/NotificationCenter';
import UserMenu from '../components/UserMenu';
import CancelModal from '../components/CancelModal';
import StatCard from '../components/StatCard';

export default function PromoterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToast();

  const [venues, setVenues] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking Workflow State
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueCalendar, setVenueCalendar] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [slotAssignments, setSlotAssignments] = useState({});
  const [availableBands, setAvailableBands] = useState([]);
  const [bandSearch, setBandSearch] = useState("");
  
  const [selectedDaySlots, setSelectedDaySlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchInitialData = async () => {
    try {
      const [allVenues, userGigs, userOrgs] = await Promise.all([
        venueApi.getVenues(),
        bookingApi.getUserBookings(user.id),
        profileApi.getOrganizationsByUser(user.id)
      ]);
      setVenues(allVenues || []);
      setMyGigs(userGigs || []);
      setOrganizations(userOrgs || []);
    } catch (error) {
      console.error("Errore caricamento dashboard promoter:", error);
      toast.error(getErrorMessage(error, "caricamento della dashboard"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInitialData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const openVenueDetails = async (venue) => {
    setSelectedVenue(venue);
    try {
      const now = new Date();
      const data = await slotApi.getCalendar(venue.id, now.getMonth() + 1, now.getFullYear());
      setVenueCalendar(data.calendarColors || {});
      setIsBookingModalOpen(true);
    } catch (error) {
      console.error("Errore caricamento calendario locale:", error);
      toast.error(getErrorMessage(error, "caricamento del calendario"));
    }
  };

  const handleDateClick = async (dateStr) => {
    setSelectedDate(dateStr);
    try {
      const slots = await slotApi.getSlotsByVenueAndDate(selectedVenue.id, dateStr);
      setSelectedDaySlots(slots || []);
    } catch (error) {
      console.error("Errore recupero slot giornata:", error);
      toast.error(getErrorMessage(error, "recupero degli slot"));
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
      setAvailableBands(data || []);
    } catch (error) {
      console.error("Errore ricerca band:", error);
      toast.error(getErrorMessage(error, "ricerca della band"));
    }
  };

  const handleCreateBooking = async () => {
    if (selectedSlots.length === 0) return;
    
    const assignments = selectedSlots.map(s => slotAssignments[s.id]);
    if (assignments.some(a => !a)) {
      toast.error("Assegna una band a ogni slot selezionato.");
      return;
    }

    try {
      await bookingApi.createPromoterBooking({
        promoterId: user.id,
        venueId: selectedVenue.id,
        slotIds: selectedSlots.map(s => s.id),
        bandIds: assignments
      });
      toast.success("Richiesta di booking multiplo inviata con successo!");
      setIsBookingModalOpen(false);
      setSelectedSlots([]);
      setSlotAssignments({});
      fetchInitialData();
    } catch (error) {
      console.error("Errore creazione booking promoter:", error);
      toast.error(getErrorMessage(error, "creazione del booking"));
    }
  };

  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancelBooking = async () => {
    try {
      await bookingApi.cancelBookingByVenue(user.id, selectedBookingForCancel.bookingId, cancelReason);
      toast.success("Evento annullato con successo");
      setIsCancelModalOpen(false);
      setCancelReason("");
      fetchInitialData();
    } catch (error) {
      console.error("Errore cancellazione booking promoter:", error);
      toast.error(getErrorMessage(error, "cancellazione del booking"));
    }
  };

  if (isLoading) return <div className="min-h-screen bg-easygig-dark flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div className="min-h-screen bg-easygig-dark text-slate-200 p-6 lg:p-10 font-sans selection:bg-indigo-600/30 overflow-x-hidden relative">
      
      {/* Background illumination */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white shadow-md">
                <Briefcase size={16} />
              </div>
              <span className="badge-indigo">Promoter Professionista</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Organizzatore</h1>
            <p className="text-slate-400 text-xs mt-0.5">Gestisci la programmazione per i tuoi locali e il roster di band</p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationCenter userId={user?.id} />
            <UserMenu />
            <button 
              onClick={() => navigate('/messages')}
              className="btn-primary py-2.5 px-4 text-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messaggi</span>
            </button>
          </div>
        </header>

        <div className="mb-8">
          <GlobalSearch />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Eventi Organizzati" 
            value={myGigs.filter(g => g.status === 'ACCEPTED').length} 
            icon={<CheckCircle2 className="text-emerald-400" />} 
            trend="Totale confermati"
          />
          <StatCard 
            label="In Attesa" 
            value={myGigs.filter(g => g.status === 'PENDING').length} 
            icon={<Clock className="text-amber-400" />} 
            trend="Proposte attive"
          />
          <StatCard 
            label="Band nel Roster" 
            value={organizations[0]?.bands?.length || 0} 
            icon={<Music className="text-indigo-400" />} 
            trend="Artisti gestiti"
          />
          <StatCard 
            label="Strike" 
            value={`${user?.strikes || 0}/5`} 
            icon={<AlertTriangle className={user?.strikes > 0 ? "text-rose-400" : "text-slate-500"} />} 
            trend={user?.strikes >= 4 ? "Ban Imminente" : "Account Safe"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main: Roster & Locations */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Roster Section */}
            <section className="glass-panel p-6 lg:p-8 rounded-2xl">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                    <Music className="text-indigo-400 w-5 h-5" /> Il Tuo Roster
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">{organizations[0]?.bands?.length || 0} Band</span>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {organizations[0]?.bands?.length > 0 ? (
                    organizations[0].bands.map(band => (
                      <div key={band.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3 group hover:border-slate-700 transition-all cursor-pointer">
                         <div className="w-10 h-10 bg-indigo-600/10 rounded-lg flex items-center justify-center font-bold text-indigo-400 border border-slate-800 shrink-0">
                            {band.name.charAt(0)}
                         </div>
                         <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate">{band.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{band.cityName || 'Italia'}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                       <p className="text-slate-400 text-xs italic">Nessuna band associata all'organizzazione.</p>
                    </div>
                  )}
               </div>
            </section>

            {/* Locations Section */}
            <section className="glass-panel p-6 lg:p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                  <TrendingUp className="text-indigo-400 w-5 h-5" /> Locali Disponibili per Programmazione
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venues.slice(0, 4).map(venue => (
                  <div key={venue.id} className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{venue.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs">
                           <MapPin size={13} />
                           <span>{venue.address?.city?.name || 'Città non specificata'}</span>
                        </div>
                      </div>
                      <span className="badge-indigo">
                        {venue.capacity} PAX
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => openVenueDetails(venue)}
                      className="w-full btn-secondary py-2.5 text-xs"
                    >
                      Verifica Date Libere
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* My Organized Events */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Calendar className="text-indigo-400 w-5 h-5" /> Gestione Eventi Organizzati
                </h3>
              </div>

              <div className="space-y-3">
                {myGigs.length === 0 ? (
                  <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 text-xs italic">
                    Nessun evento attivo. Inizia a programmare date per il tuo roster!
                  </div>
                ) : (
                  myGigs.map(gig => (
                    <div key={gig.bookingId} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${gig.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {gig.status === 'ACCEPTED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-bold text-white text-sm">Booking #{String(gig.bookingId).substring(0, 6)}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${gig.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {gig.status}
                              </span>
                           </div>
                           <p className="text-xs text-slate-400 font-medium">
                             {gig.slotStart ? format(new Date(gig.slotStart), 'EEEE d MMMM yyyy', { locale: it }) : 'Data da definire'}
                           </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                         <div className="text-left">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Locale ID: {gig.venueId}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Band ID: {gig.bandId}</p>
                         </div>
                         <button 
                            onClick={() => { setSelectedBookingForCancel(gig); setIsCancelModalOpen(true); }}
                            className="p-2 bg-rose-500/10 rounded-lg hover:bg-rose-500 hover:text-white transition-all text-rose-400"
                            title="Annulla Evento"
                         >
                            <X size={18} />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Performance & Analytics */}
          <div className="lg:col-span-4 space-y-6">
             <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <h3 className="text-base font-bold text-white tracking-tight mb-4">Performance Roster</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-xs text-slate-400">Tasso Conversione</span>
                      <span className="text-lg font-bold text-white">68%</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-xs text-slate-400">Eventi Mensili</span>
                      <span className="text-lg font-bold text-white">24</span>
                   </div>
                   <button className="btn-primary w-full py-2.5 text-xs">Scarica Report Performance</button>
                </div>
             </div>

             <section className="glass-panel p-6 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                   <Award size={18} />
                   <h4 className="text-xs font-bold uppercase tracking-wider">Consiglio Management</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed italic">
                  "I locali preferiscono i promoter che gestiscono roster ben definiti per genere musicale. Organizza date tematiche per massimizzare la presenza di pubblico."
                </p>
             </section>
          </div>
        </div>

      </div>

      {/* Modal: Organizza Booking Multiplo */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Organizza Evento: {selectedVenue?.name}</h3>
                <p className="text-slate-400 text-xs mt-0.5">Seleziona i giorni e assegna le band del tuo roster agli slot desiderati.</p>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Calendar Day Selection */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                  <Calendar size={15} /> Disponibilità Giorno
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.keys(venueCalendar).map(date => (
                    <button 
                      key={date}
                      onClick={() => handleDateClick(date)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${selectedDate === date ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 hover:bg-slate-800'}`}
                    >
                      <p className="font-bold text-xs">{format(new Date(date), 'EEEE d MMMM', { locale: it })}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${venueCalendar[date] === 'green' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                         <span className="text-[10px] font-semibold text-slate-400">{venueCalendar[date] === 'green' ? 'Disponibile' : 'In attesa'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle: Slot Detail for selected day */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                  <LayoutGrid size={15} /> Slot Orari del Giorno
                </h4>
                {selectedDate ? (
                  <div className="space-y-3">
                    <button 
                      onClick={selectFullDay}
                      className="w-full btn-secondary py-2 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      Seleziona Tutti gli Slot Liberi
                    </button>
                    
                    <div className="space-y-2">
                      {selectedDaySlots.map(slot => (
                        <div 
                          key={slot.id} 
                          onClick={() => toggleSlotSelection(slot)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedSlots.find(s => s.id === slot.id) ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs">{format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}</span>
                            {selectedSlots.find(s => s.id === slot.id) && <CheckCircle2 size={14} className="text-indigo-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic text-center py-10">Seleziona un giorno a sinistra.</p>
                )}
              </div>

              {/* Right: Band Assignment */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                  <Music size={15} /> Assegnazione Band
                </h4>
                {selectedSlots.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">Seleziona uno o più slot per procedere.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedSlots.map(slot => (
                      <div key={slot.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <p className="text-[11px] font-bold text-indigo-400">
                          {format(new Date(slot.start), 'd MMM')} @ {format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}
                        </p>
                        
                        {slotAssignments[slot.id] ? (
                          <div className="flex items-center justify-between bg-emerald-500/10 p-2 rounded-lg text-xs">
                            <span className="font-bold text-emerald-400">Band ID: {slotAssignments[slot.id]}</span>
                            <button onClick={() => setSlotAssignments({...slotAssignments, [slot.id]: null})} className="text-rose-400"><X size={14} /></button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Cerca band..." 
                                value={bandSearch}
                                onChange={(e) => setBandSearch(e.target.value)}
                                className="input-studio flex-1 text-xs py-1.5 px-3"
                              />
                              <button onClick={searchBands} className="btn-secondary p-2 text-xs"><Search size={14} /></button>
                            </div>
                            <div className="max-h-24 overflow-y-auto space-y-1">
                              {availableBands.map(band => (
                                <div 
                                  key={band.id} 
                                  onClick={() => setSlotAssignments({...slotAssignments, [slot.id]: band.id})}
                                  className="p-1.5 hover:bg-slate-800 rounded text-xs cursor-pointer text-slate-300"
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

            <div className="p-6 border-t border-slate-800 bg-slate-900 flex gap-3">
               <button 
                 onClick={() => setIsBookingModalOpen(false)}
                 className="flex-1 btn-secondary py-3 text-xs"
               >
                 Annulla
               </button>
               <button 
                 onClick={handleCreateBooking}
                 disabled={selectedSlots.length === 0}
                 className="flex-[2] btn-primary py-3 text-xs"
               >
                 Invia Proposta Multipla
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancellazione Booking */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => { setIsCancelModalOpen(false); setSelectedBookingForCancel(null); setCancelReason(''); }}
        onConfirm={handleCancelBooking}
        cancelReason={cancelReason}
        onReasonChange={setCancelReason}
        slotStart={selectedBookingForCancel?.slotStart}
        disableOnLateCancellation={true}
        title="Annulla Evento"
        lateWarningMessage="Mancano meno di 48 ore all'evento. Non puoi più annullare l'evento in autonomia, contatta direttamente il Direttore Artistico."
        confirmLabel="Conferma Annullamento"
      />
    </div>
  );
}
