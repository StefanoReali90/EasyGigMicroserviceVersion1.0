import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Landmark, 
  Clock, 
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  Settings,
  Star,
  Search,
  UserPlus,
  X,
  MessageSquare,
  MapPin,
  Phone,
  Info,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlobalSearch from '../components/GlobalSearch';
import PhotoGallery from '../components/PhotoGallery';
import * as venueApi from '../api/venues';
import * as slotApi from '../api/slots';
import * as bookingApi from '../api/bookings';
import * as userApi from '../api/users';
import * as profileApi from '../api/profile';
import * as reviewApi from '../api/reviews';
import NotificationCenter from '../components/NotificationCenter';
import { getErrorMessage } from '../utility/errorHandler';
import { useToast } from '../context/ToastContext';
import UserMenu from '../components/UserMenu';
import ReviewModal from '../components/ReviewModal';
import CancelModal from '../components/CancelModal';
import ConfirmModal from '../components/ConfirmModal';
import StatCard from '../components/StatCard';

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [daySlots, setDaySlots] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals & Sections
  const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isDaySlotsModalOpen, setIsDaySlotsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Confirm Accept All Pending Modal State
  const [isConfirmAcceptAllOpen, setIsConfirmAcceptAllOpen] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async ({ rating, comment }) => {
    setIsSubmittingReview(true);
    try {
      await reviewApi.createReview({
        reviewedId: selectedBookingForReview.artistUserId || selectedBookingForReview.bandId,
        bookingRequestId: selectedBookingForReview.id,
        rate: rating,
        comment,
        role: 'ARTIST'
      }, user.id);
      
      toast.success('Recensione inviata!');
      setIsReviewModalOpen(false);
      setSelectedBookingForReview(null);
    } catch (error) {
      console.error('Errore invio recensione:', error);
      toast.error(getErrorMessage(error, 'invio della recensione'));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const handleCancelBooking = async (reason) => {
    setIsSubmittingCancel(true);
    try {
      await bookingApi.cancelBookingByVenue(user.id, selectedBookingForCancel.id, reason);
      toast.success('Prenotazione annullata con successo.');
      setIsCancelModalOpen(false);
      setCancelReason('');
      setSelectedBookingForCancel(null);
      fetchBookingRequests(selectedVenue.id);
    } catch (error) {
      console.error('Errore cancellazione booking:', error);
      toast.error(getErrorMessage(error, 'cancellazione del booking'));
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Form States
  const [newVenue, setNewVenue] = useState({ name: '', address: '', description: '', phone: '', email: '', venueType: 'BAR_PUBS', techSpec: '', cityId: '' });
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");

  const [newSlot, setNewSlot] = useState({ date: format(new Date(), 'yyyy-MM-dd'), startTime: '21:00', endTime: '23:30' });
  const [bandSearchQuery, setBandSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Slot Multipli per una giornata
  const [slotStartTime, setSlotStartTime] = useState("21:00");
  const [slotEndTime, setSlotEndTime] = useState("22:30");
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchVenues();
    }
  }, [user]);

  useEffect(() => {
    if (selectedVenue) {
      fetchCalendar(selectedVenue.id, currentMonth);
      fetchBookingRequests(selectedVenue.id);
    }
  }, [selectedVenue, currentMonth]);

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const data = await venueApi.getVenuesByDirector(user.id);
      setVenues(data);
      if (data.length > 0) {
        setSelectedVenue(data[0]);
      }
    } catch (error) {
      console.error("Errore recupero locali:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySearch = async (val) => {
    setCitySearch(val);
    if (val.length > 2) {
      try {
        const results = await profileApi.searchCities(val);
        setCities(results);
      } catch (err) {
        console.error("Errore ricerca città:", err);
      }
    }
  };

  const handleCreateVenue = async () => {
    if (!newVenue.name || !newVenue.cityId) {
      toast.error("Compila i campi obbligatori Nome e Città.");
      return;
    }
    try {
      const created = await venueApi.createVenue({
        ...newVenue,
        directorId: user.id,
        address: { street: newVenue.address, cityId: parseInt(newVenue.cityId) }
      });
      setVenues([...venues, created]);
      setSelectedVenue(created);
      setIsAddVenueModalOpen(false);
      setNewVenue({ name: '', address: '', description: '', phone: '', email: '', venueType: 'BAR_PUBS', techSpec: '', cityId: '' });
      toast.success("Locale aggiunto con successo!");
    } catch (error) {
      console.error("Errore creazione locale:", error);
      toast.error(getErrorMessage(error, "aggiunta del locale"));
    }
  };

  const fetchCalendar = async (venueId, date) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const data = await slotApi.getCalendar(venueId, month, year);
      setCalendarData(data.calendarColors || {});
    } catch (error) {
      console.error("Errore recupero calendario:", error);
    }
  };

  const fetchBookingRequests = async (venueId) => {
    try {
      const data = await bookingApi.getBookingRequestsForVenue(venueId);
      setBookingRequests(data);
    } catch (error) {
      console.error("Errore recupero richieste:", error);
    }
  };

  const handleDateClick = async (day) => {
    setSelectedDate(day);
    if (selectedVenue) {
      const dateStr = format(day, 'yyyy-MM-dd');
      try {
        const slots = await slotApi.getSlotsByVenueAndDate(selectedVenue.id, dateStr);
        setDaySlots(slots);
        setIsDaySlotsModalOpen(true);
      } catch (error) {
        console.error("Errore recupero slot del giorno:", error);
      }
    }
  };

  const handleCreateSlotSingle = async () => {
    if (!selectedVenue || !selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startIso = `${dateStr}T${slotStartTime}:00`;
    const endIso = `${dateStr}T${slotEndTime}:00`;

    if (slotStartTime >= slotEndTime) {
      toast.error("L'ora di fine dello slot deve essere successiva all'ora di inizio.");
      return;
    }

    const hasOverlap = daySlots.some(s => {
      const sStart = format(new Date(s.start), 'HH:mm');
      const sEnd = format(new Date(s.end), 'HH:mm');
      return (slotStartTime < sEnd && slotEndTime > sStart);
    });

    if (hasOverlap) {
      toast.error("Esiste già uno slot che si sovrappone a questo orario per il giorno selezionato!");
      return;
    }

    setIsAddingSlot(true);
    try {
      await slotApi.createSlot({
        venueId: selectedVenue.id,
        start: startIso,
        end: endIso
      });
      const updatedSlots = await slotApi.getSlotsByVenueAndDate(selectedVenue.id, dateStr);
      setDaySlots(updatedSlots);
      fetchCalendar(selectedVenue.id, currentMonth);
      toast.success("Slot creato con successo!");
    } catch (error) {
      console.error("Errore creazione slot:", error);
      toast.error(getErrorMessage(error, "creazione dello slot"));
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await slotApi.deleteSlot(slotId);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const updatedSlots = await slotApi.getSlotsByVenueAndDate(selectedVenue.id, dateStr);
      setDaySlots(updatedSlots);
      fetchCalendar(selectedVenue.id, currentMonth);
      toast.success("Slot eliminato.");
    } catch (error) {
      console.error("Errore eliminazione slot:", error);
      toast.error(getErrorMessage(error, "eliminazione dello slot"));
    }
  };

  const handleInviteBand = async (band) => {
    if (!selectedDate || !selectedVenue) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await bookingApi.sendInviteToBand({
        venueId: selectedVenue.id,
        bandId: band.id,
        date: dateStr
      });
      toast.success(`Invito inviato con successo alla band ${band.name}!`);
      setIsInviteModalOpen(false);
      fetchBookingRequests(selectedVenue.id);
    } catch (error) {
      console.error("Errore invio invito:", error);
      toast.error(getErrorMessage(error, "invio dell'invito"));
    }
  };

  const handleBookingAction = async (requestId, action) => {
    try {
      if (action === 'ACCEPT') {
        await bookingApi.acceptBookingRequest(requestId);
        toast.success("Richiesta accettata con successo!");
      } else {
        await bookingApi.rejectBookingRequest(requestId);
        toast.info("Richiesta rifiutata.");
      }
      fetchBookingRequests(selectedVenue.id);
      fetchCalendar(selectedVenue.id, currentMonth);
    } catch (error) {
      console.error(`Errore durante ${action}:`, error);
      toast.error(getErrorMessage(error, "gestione della richiesta"));
    }
  };

  const handleAcceptAllPending = async () => {
    try {
      const pending = bookingRequests.filter(r => r.status === 'PENDING');
      for (const req of pending) {
        await bookingApi.acceptBookingRequest(req.id);
      }
      toast.success("Tutte le richieste pendenti sono state accettate!");
      setIsConfirmAcceptAllOpen(false);
      fetchBookingRequests(selectedVenue.id);
      fetchCalendar(selectedVenue.id, currentMonth);
    } catch (error) {
      console.error("Errore accettazione massiva:", error);
      toast.error(getErrorMessage(error, "accettazione massiva"));
    }
  };

  // Search Bands API
  const handleBandSearch = async (val) => {
    setBandSearchQuery(val);
    if (val.length > 1) {
      try {
        const results = await profileApi.searchBands({ name: val });
        setSearchResults(results);
      } catch (error) {
        console.error("Errore ricerca band:", error);
      }
    }
  };

  // Calendar Helpers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
      <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300">
        <ChevronLeft size={20} />
      </button>
      <h2 className="text-base font-bold text-white tracking-tight uppercase">
        {format(currentMonth, 'MMMM yyyy', { locale: it })}
      </h2>
      <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300">
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    return (
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {days.map((day, i) => (
          <div key={i} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const isCurrentMonth = isSameMonth(day, monthStart);
        const colorState = calendarData[formattedDate];

        let stateClasses = "bg-slate-950/60 text-slate-400 hover:border-slate-700 border-slate-800/80";
        if (colorState === 'green') {
          stateClasses = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50 shadow-sm shadow-emerald-500/5";
        } else if (colorState === 'yellow') {
          stateClasses = "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-500/50 shadow-sm shadow-amber-500/5";
        } else if (colorState === 'red') {
          stateClasses = "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:border-rose-500/50 shadow-sm shadow-rose-500/5";
        }

        const cloneDay = day;
        days.push(
          <div
            key={day.toString()}
            onClick={() => isCurrentMonth && handleDateClick(cloneDay)}
            className={`min-h-[75px] sm:min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group ${
              !isCurrentMonth ? "opacity-25 border-transparent pointer-events-none" : stateClasses
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold ${isSameDay(day, new Date()) ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center' : ''}`}>
                {format(day, 'd')}
              </span>
              {colorState && (
                <span className={`w-2 h-2 rounded-full ${
                  colorState === 'green' ? 'bg-emerald-400' :
                  colorState === 'yellow' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
              )}
            </div>

            {colorState && (
              <div className="mt-1">
                <span className="text-[9px] font-bold uppercase tracking-wider block truncate">
                  {colorState === 'green' ? 'Slot Libero' : colorState === 'yellow' ? 'Richiesta' : 'Occupato'}
                </span>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-2">{rows}</div>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-easygig-dark flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  const pendingRequests = bookingRequests.filter(r => r.status === 'PENDING');
  const acceptedBookings = bookingRequests.filter(r => r.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-easygig-dark text-slate-200 p-6 lg:p-10 font-sans selection:bg-indigo-600/30 overflow-x-hidden relative">
      
      {/* Background illumination */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Dashboard */}
        <header className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                <Landmark size={18} />
              </div>
              <span className="badge-indigo">Direttore Artistico</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Studio di Direzione Artistica</h1>
            <p className="text-slate-400 text-xs mt-0.5">Gestisci la programmazione live, gli slot e le candidature per il tuo locale</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NotificationCenter userId={user?.id} />
            <UserMenu />
            
            <button 
              onClick={() => navigate('/messages')} 
              className="btn-primary py-2.5 px-4 text-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messaggi</span>
            </button>

            <button 
              onClick={() => setIsAddVenueModalOpen(true)}
              className="btn-secondary py-2.5 px-4 text-xs"
            >
              <Plus size={16} />
              <span>Nuovo Locale</span>
            </button>
          </div>
        </header>

        <div className="mb-8">
          <GlobalSearch />
        </div>

        {/* Selector Locale & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Locale Selezionato</span>
              {venues.length > 0 ? (
                <div className="space-y-3">
                  <select 
                    value={selectedVenue?.id || ''} 
                    onChange={(e) => setSelectedVenue(venues.find(v => v.id === parseInt(e.target.value)))}
                    className="input-studio font-bold text-sm text-white"
                  >
                    {venues.map(v => (
                      <option key={v.id} value={v.id} className="bg-slate-900 text-white">{v.name}</option>
                    ))}
                  </select>
                  {selectedVenue && (
                    <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{selectedVenue.name}</span>
                        <span className="badge-indigo">{selectedVenue.venueType || 'Bar / Pub'}</span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin size={13} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{selectedVenue.address?.street || 'Indirizzo non impostato'}</span>
                      </p>
                      <div className="pt-2 border-t border-slate-800 flex gap-2">
                        <Link 
                          to={`/venue/settings/${selectedVenue.id}`}
                          className="btn-secondary py-1.5 px-3 text-[11px] flex-1 text-center"
                        >
                          <Settings size={13} />
                          <span>Impostazioni Technical Spec</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  Nessun locale associato al tuo profilo. Crea il tuo primo locale per cominciare!
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Live In Programma" value={acceptedBookings.length} color="from-emerald-500/20 to-emerald-500/5" text="text-emerald-400" />
            <StatCard label="Candidature Pendenti" value={pendingRequests.length} color="from-amber-500/20 to-amber-500/5" text="text-amber-400" />
            <StatCard label="Rating Locale" value={selectedVenue?.rating ?? '5.0'} color="from-indigo-500/20 to-indigo-500/5" text="text-indigo-400" />
          </div>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Calendar */}
          <div className="lg:col-span-7 glass-panel p-6 lg:p-8 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <CalendarIcon className="text-indigo-400" size={20} />
                  Programmazione Calendario
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Clicca su un giorno per gestire gli slot e invitare le band</p>
              </div>
            </div>

            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </div>

          {/* Right Column: Candidature & Live Confermati */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Richieste Pendenti */}
            <section className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Clock className="text-amber-400" size={18} />
                  Candidature In Attesa ({pendingRequests.length})
                </h3>
                {pendingRequests.length > 0 && (
                  <button 
                    onClick={() => setIsConfirmAcceptAllOpen(true)}
                    className="text-[11px] font-bold text-emerald-400 hover:underline"
                  >
                    Accetta Tutte
                  </button>
                )}
              </div>

              {pendingRequests.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-4 text-center">Nessuna candidatura in attesa al momento.</p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-xs">Candidatura ID: #{req.id}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                            {req.slotStart ? format(new Date(req.slotStart), 'EEEE d MMMM, HH:mm', { locale: it }) : 'Data non specificata'}
                          </p>
                        </div>
                        <span className="badge-indigo text-[10px]">Candidato</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button 
                          onClick={() => handleBookingAction(req.id, 'ACCEPT')}
                          className="flex-1 btn-primary py-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Accetta
                        </button>
                        <button 
                          onClick={() => handleBookingAction(req.id, 'REJECT')}
                          className="flex-1 btn-secondary py-1.5 text-[11px] text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        >
                          Rifiuta
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Live Confermati */}
            <section className="glass-panel p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={18} />
                Live Confermati ({acceptedBookings.length})
              </h3>

              {acceptedBookings.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-4 text-center">Nessun live confermato per questo locale.</p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {acceptedBookings.map(req => (
                    <div key={req.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-xs">Live Confermato #{req.id}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {req.slotStart ? format(new Date(req.slotStart), 'EEEE d MMMM, HH:mm', { locale: it }) : 'Data non specificata'}
                          </p>
                        </div>
                        <span className="badge-emerald text-[10px]">CONFERMATO</span>
                      </div>

                      <div className="flex gap-2">
                        {new Date(req.slotStart) <= new Date() && (
                          <button 
                            onClick={() => { setSelectedBookingForReview(req); setIsReviewModalOpen(true); }}
                            className="flex-1 btn-secondary py-1 text-[11px]"
                          >
                            Recensisci Artista
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedBookingForCancel(req); setIsCancelModalOpen(true); }}
                          className="btn-secondary py-1 px-3 text-[11px] text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

        </div>

      </div>

      {/* Modal Gestione Slot Giornata */}
      {isDaySlotsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsDaySlotsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight mb-1">
              Slot per il {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: it }) : ''}
            </h3>
            <p className="text-slate-400 text-xs mb-6">Visualizza, aggiungi o elimina gli slot disponibili per questa giornata (1 Slot = 1 Esibizione Band)</p>

            {/* Form Aggiunta Slot Orario */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aggiungi Nuovo Slot Orario</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Inizio Esibizione</label>
                  <input 
                    type="time" 
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="input-studio py-1.5 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Fine Esibizione</label>
                  <input 
                    type="time" 
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="input-studio py-1.5 px-3 text-xs"
                  />
                </div>
              </div>
              <button 
                onClick={handleCreateSlotSingle}
                disabled={isAddingSlot}
                className="w-full btn-primary py-2 text-xs"
              >
                {isAddingSlot ? 'Creazione in corso...' : '+ Crea Slot in questo Orario'}
              </button>
            </div>

            {/* Elenco Slot Esistenti della Giornata */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slot Attivi ({daySlots.length})</h4>
              {daySlots.length === 0 ? (
                <p className="text-slate-500 text-xs italic text-center py-4">Nessuno slot creato per questo giorno.</p>
              ) : (
                daySlots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-indigo-400" />
                      <div>
                        <p className="font-bold text-xs text-white">
                          {format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}
                        </p>
                        <span className={`text-[10px] font-bold uppercase ${slot.state === 'AVAILABLE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {slot.state === 'AVAILABLE' ? 'Libero' : 'Occupato'}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Elimina Slot"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setIsDaySlotsModalOpen(false); setIsInviteModalOpen(true); }}
                className="flex-1 btn-secondary py-2.5 text-xs text-indigo-400 border-indigo-500/30"
              >
                Invita una Band per questa data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Invita Band */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight mb-4">
              Invita una Band
            </h3>

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Cerca band per nome..."
                value={bandSearchQuery}
                onChange={(e) => handleBandSearch(e.target.value)}
                className="input-studio text-xs py-2 px-3"
              />

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map(band => (
                  <div key={band.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <p className="font-bold text-xs text-white">{band.name}</p>
                      <p className="text-[10px] text-slate-400">{band.cityName}</p>
                    </div>
                    <button 
                      onClick={() => handleInviteBand(band)}
                      className="btn-primary py-1 px-3 text-[11px]"
                    >
                      Invita
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aggiungi Locale */}
      {isAddVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsAddVenueModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight mb-4">Nuovo Locale</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nome Locale *</label>
                <input 
                  type="text" 
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({...newVenue, name: e.target.value})}
                  placeholder="Es. Blue Note Club"
                  className="input-studio py-2 px-3"
                />
              </div>

              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Città *</label>
                <input 
                  type="text" 
                  value={citySearch}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  placeholder="Cerca città (es. Roma, Milano)..."
                  className="input-studio py-2 px-3"
                />
                {cities.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-40 overflow-y-auto">
                    {cities.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => { setNewVenue({...newVenue, cityId: c.id}); setCitySearch(c.name); setCities([]); }}
                        className="p-2 hover:bg-slate-800 cursor-pointer text-xs text-slate-200"
                      >
                        {c.name} ({c.regionName})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Indirizzo</label>
                <input 
                  type="text" 
                  value={newVenue.address}
                  onChange={(e) => setNewVenue({...newVenue, address: e.target.value})}
                  placeholder="Via/Piazza e numero civico"
                  className="input-studio py-2 px-3"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tipo Locale</label>
                <select 
                  value={newVenue.venueType}
                  onChange={(e) => setNewVenue({...newVenue, venueType: e.target.value})}
                  className="input-studio py-2 px-3"
                >
                  <option value="BAR_PUBS">Bar / Pub</option>
                  <option value="LIVE_CLUB">Live Club</option>
                  <option value="THEATER">Teatro</option>
                  <option value="ARENA">Arena / Festival</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAddVenueModalOpen(false)} className="flex-1 btn-secondary py-2.5">Annulla</button>
                <button onClick={handleCreateVenue} className="flex-1 btn-primary py-2.5">Crea Locale</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Accept All Pending Modal */}
      <ConfirmModal
        isOpen={isConfirmAcceptAllOpen}
        onClose={() => setIsConfirmAcceptAllOpen(false)}
        onConfirm={handleAcceptAllPending}
        title="Accetta Tutte le Candidature Pendenti"
        message="Sei sicuro di voler accettare TUTTE le candidature attualmente pendenti per questo locale?"
        confirmLabel="Conferma Accettazione Massiva"
        isDanger={false}
      />

      {/* Modal Recensione */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => { setIsReviewModalOpen(false); setSelectedBookingForReview(null); }}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
        title="Recensisci l'Artista"
        placeholder="Com'è andata l'esibizione? Puntualità, coinvolgimento del pubblico..."
      />

      {/* Modal Cancellazione */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => { setIsCancelModalOpen(false); setSelectedBookingForCancel(null); setCancelReason(''); }}
        onConfirm={handleCancelBooking}
        cancelReason={cancelReason}
        onReasonChange={setCancelReason}
        slotStart={selectedBookingForCancel?.slotStart}
        isSubmitting={isSubmittingCancel}
        disableOnLateCancellation={true}
        title="Annulla Prenotazione"
        confirmLabel="Conferma Cancellazione"
      />

    </div>
  );
}
