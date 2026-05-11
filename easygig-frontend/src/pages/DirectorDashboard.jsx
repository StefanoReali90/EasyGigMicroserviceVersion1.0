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
  MessageSquare
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
import { AlertTriangle } from 'lucide-react';
import { getErrorMessage } from '../utility/errorHandler';
import UserMenu from '../components/UserMenu';



export default function DirectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [requests, setRequests] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [requestDetails, setRequestDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  
  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedDayForInvite, setSelectedDayForInvite] = useState(null);
  const [bandSearchQuery, setBandSearchQuery] = useState("");
  const [foundBands, setFoundBands] = useState([]);
  const [isSearchingBands, setIsSearchingBands] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // 1. Carica i locali gestiti dal direttore
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await venueApi.getVenuesByDirector(user.id);
        setVenues(data);
        if (data.length > 0) setSelectedVenue(data[0]);
      } catch (error) {
        console.error("Errore caricamento locali:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchVenues();
  }, [user]);

  // 2. Carica la disponibilità e le richieste quando cambia mese o locale
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedVenue) return;
      try {
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        
        const [calData, reqData, allBookings] = await Promise.all([
          slotApi.getCalendar(selectedVenue.id, month, year),
          bookingApi.getVenueRequests(selectedVenue.id),
          bookingApi.getVenueRequests(selectedVenue.id, 'ACCEPTED')
        ]);
        
        setCalendarData(calData.calendarColors || {});
        setRequests(reqData);
        
        // Filtriamo gli eventi conclusi (data passata)
        const now = new Date();
        const past = allBookings.filter(b => new Date(b.slotStart || b.createdAt) < now);
        setPastEvents(past);

        const details = {};
        const allRelevantRequests = [...reqData, ...past];
        await Promise.all(allRelevantRequests.map(async (req) => {
          try {
            // Fetch User/Artist
            const artist = await userApi.getUserById(req.userId);
            
            // Fetch Band if applicable
            let band = null;
            if (req.bandId) {
              band = await profileApi.getBandById(req.bandId).catch(() => null);
            }
            
            details[req.bookingId] = { artist, band };
          } catch (e) {
            console.error("Errore fetch dettagli richiesta:", e);
          }
        }));
        setRequestDetails(details);

      } catch (error) {
        console.error("Errore caricamento dati dashboard:", error);
      }
    };
    fetchData();
  }, [selectedVenue, currentMonth]);

  // Ricerca band
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (bandSearchQuery.length > 2) {
        setIsSearchingBands(true);
        try {
          const data = await profileApi.searchBands({ name: bandSearchQuery });
          setFoundBands(data);
        } catch (error) {
          console.error("Errore ricerca band:", error);
        } finally {
          setIsSearchingBands(false);
        }
      } else {
        setFoundBands([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [bandSearchQuery]);

  const handleToggleSlot = async (day) => {
    if (!selectedVenue) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasSlot = calendarData[dateStr];

    if (!hasSlot) {
      setSelectedDayForInvite(day);
      setIsInviteModalOpen(true);
    }
  };

  const createFreeSlot = async () => {
    if (!selectedDayForInvite) return;
    try {
      const start = new Date(selectedDayForInvite);
      start.setHours(21, 0, 0);
      const end = new Date(selectedDayForInvite);
      end.setDate(end.getDate() + 1);
      end.setHours(0, 0, 0);

      await slotApi.createSlot({
        venueId: selectedVenue.id,
        start: start.toISOString(),
        end: end.toISOString()
      });
      
      refreshData();
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error("Errore creazione slot:", error);
      alert(getErrorMessage(error, "creazione dello slot"));
    }

  };

  const inviteBand = async (band) => {
    try {
      const start = new Date(selectedDayForInvite);
      start.setHours(21, 0, 0);
      const end = new Date(selectedDayForInvite);
      end.setDate(end.getDate() + 1);
      end.setHours(0, 0, 0);

      const slot = await slotApi.createSlot({
        venueId: selectedVenue.id,
        start: start.toISOString(),
        end: end.toISOString()
      });

      const targetUserId = band.userId || band.id; 

      await bookingApi.inviteArtist(selectedVenue.id, targetUserId, slot.id);
      
      alert(`Invito inviato a ${band.name}!`);
      refreshData();
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error("Errore invio invito:", error);
      alert(getErrorMessage(error, "invio dell'invito"));
    }

  };

  const handleRequest = async (requestId, action) => {
    try {
      if (action === 'accept') {
        await bookingApi.acceptRequest(requestId, user.id);
      } else {
        await bookingApi.rejectRequest(requestId, user.id);
      }
      refreshData();
    } catch (error) {
      console.error("Errore gestione richiesta:", error);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await reviewApi.createReview({
        reviewedId: selectedBookingForReview.userId,
        bookingRequestId: selectedBookingForReview.bookingId,
        rate: reviewRating,
        comment: reviewComment,
        role: "ARTIST" 
      }, user.id);
      
      alert("Recensione inviata!");
      setIsReviewModalOpen(false);
      setReviewRating(5);
      setReviewComment("");
      refreshData();
    } catch (error) {
      console.error("Errore invio recensione:", error);
      alert(getErrorMessage(error, "invio della recensione"));
    }

  };

  const handleAcceptAll = async () => {
    if (requests.length === 0) return;
    if (!window.confirm("Sei sicuro di voler accettare TUTTE le richieste pendenti?")) return;
    
    setIsProcessingAll(true);
    try {
      for (const req of requests) {
        try {
          await bookingApi.acceptRequest(req.bookingId, user.id);
        } catch (e) {
          console.error("Errore accettazione singola:", e);
        }
      }
      refreshData();
    } catch (error) {
      console.error("Errore accetta tutto:", error);
    } finally {
      setIsProcessingAll(false);
    }
  };

  const refreshData = async () => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const [calData, reqData, allBookings] = await Promise.all([
      slotApi.getCalendar(selectedVenue.id, month, year),
      bookingApi.getVenueRequests(selectedVenue.id),
      bookingApi.getVenueRequests(selectedVenue.id, 'ACCEPTED')
    ]);
    setCalendarData(calData.calendarColors || {});
    setRequests(reqData);
    const now = new Date();
    setPastEvents(allBookings.filter(b => new Date(b.slotStart || b.createdAt) < now));
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8 bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="bg-easygig-accent p-3 rounded-2xl">
            <CalendarIcon className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              {format(currentMonth, 'MMMM yyyy', { locale: it })}
            </h2>
            <p className="text-slate-400 text-sm">Gestione slot e disponibilità</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronRight />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day, index) => (
          <div key={index} className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const status = calendarData[formattedDate];
        const isSelected = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day}
            onClick={() => isCurrentMonth && handleToggleSlot(new Date(day))}
            className={`relative h-32 border border-white/5 p-2 transition-all cursor-pointer group
              ${!isCurrentMonth ? 'opacity-20 cursor-default' : 'hover:bg-white/5'}
              ${status === 'green' ? 'bg-emerald-500/10' : status === 'yellow' ? 'bg-amber-500/10' : status === 'red' ? 'bg-rose-500/10' : ''}
            `}
          >
            <span className={`text-sm font-medium ${isSelected ? 'bg-easygig-accent text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
              {format(day, 'd')}
            </span>
            
            {status && (
              <div className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase
                ${status === 'green' ? 'text-emerald-400 bg-emerald-400/10' : status === 'yellow' ? 'text-amber-400 bg-amber-400/10' : 'text-rose-400 bg-rose-400/10'}
              `}>
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'green' ? 'bg-emerald-400' : status === 'yellow' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                {status === 'green' ? 'Libero' : status === 'yellow' ? 'In Attesa' : 'Occupato'}
              </div>
            )}

            {isCurrentMonth && !status && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="text-easygig-accent" size={24} />
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-white/5 rounded-3xl overflow-hidden shadow-2xl">{rows}</div>;
  };

  if (isLoading) return <div className="min-h-screen bg-easygig-dark flex items-center justify-center"><Loader2 className="animate-spin text-easygig-accent" size={48} /></div>;

  return (
    <div className="min-h-screen bg-easygig-dark text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase">Dashboard Direttore</h1>
            <p className="text-slate-400 mt-1">Bentornato, {user?.firstName} {user?.lastName}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/messages')}
              className="bg-white/5 hover:bg-white/10 p-4 rounded-3xl border border-white/5 flex items-center gap-3 transition-all group"
            >
              <MessageSquare className="text-easygig-accent group-hover:scale-110 transition-transform" size={20} />
              <span className="font-bold text-sm hidden md:inline">Messaggi</span>
            </button>

            <NotificationCenter userId={user?.id} />
            <UserMenu />


            <div className="flex items-center gap-4 bg-slate-900 border border-white/10 p-2 rounded-2xl">
              <div className="flex items-center gap-3 px-4">
                <Landmark className="text-easygig-accent" size={20} />
                <select 
                  value={selectedVenue?.id} 
                  onChange={(e) => setSelectedVenue(venues.find(v => v.id == e.target.value))}
                  className="bg-transparent border-none outline-none font-bold text-sm cursor-pointer pr-8"
                >
                  {venues.map(v => <option key={v.id} value={v.id} className="bg-slate-900">{v.name}</option>)}
                </select>
              </div>

              <Link 
                to={`/venue/settings/${selectedVenue?.id}`}
                className="bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="Impostazioni Locale"
              >
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </header>

        <div className="mb-12">
          <GlobalSearch />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard 
            label="Eventi Conclusi" 
            value={pastEvents.length} 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            trend="+12% questo mese"
          />
          <StatsCard 
            label="Richieste Pendenti" 
            value={requests.length} 
            icon={<Clock className="text-amber-500" />} 
            trend="Risposta media: 2h"
          />
          <StatsCard 
            label="Occupazione" 
            value={`${Math.round((Object.values(calendarData).filter(v => v === 'red').length / 30) * 100)}%`} 
            icon={<Landmark className="text-indigo-500" />} 
            trend="Basato sul mese corrente"
          />
          <StatsCard 
            label="Strike" 
            value={`${user?.strikes || 0}/5`} 
            icon={<AlertTriangle className={user?.strikes > 0 ? "text-rose-500" : "text-slate-500"} />} 
            trend={user?.strikes >= 4 ? "Rischio Ban" : "Affidabilità Locale"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendario Principale */}
          <div className="lg:col-span-3">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            {/* Galleria Locale */}
            <div className="mt-12">
              {selectedVenue && <PhotoGallery type="VENUE" id={selectedVenue.id} />}
            </div>
          </div>

          {/* Sidebar Richieste */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Users size={18} className="text-easygig-accent" /> Richieste ({requests.length})
                </h3>
                {requests.length > 1 && (
                  <button 
                    onClick={handleAcceptAll}
                    disabled={isProcessingAll}
                    className="text-[10px] font-bold text-easygig-accent hover:underline uppercase tracking-tighter"
                  >
                    {isProcessingAll ? "In corso..." : "Accetta Tutti"}
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="text-slate-500 text-sm italic text-center py-8">
                    Nessuna richiesta in attesa.
                  </div>
                ) : (
                  requests.map((req) => {
                    const { artist, band } = requestDetails[req.bookingId] || {};
                    return (
                      <div key={req.bookingId} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4 group hover:border-easygig-accent/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-premium rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">
                              {band?.name?.charAt(0) || artist?.firstName?.charAt(0) || "A"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate max-w-[140px]">
                                {band ? band.name : artist ? `${artist.firstName} ${artist.lastName}` : `ID: ${req.userId}`}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star size={10} className="text-amber-400 fill-amber-400" />
                                  <span className="text-[10px] text-amber-400 font-bold">{band?.reputation || artist?.reputation || "5.0"}</span>
                                </div>
                                {band && <span className="text-[9px] bg-easygig-accent/20 text-easygig-accent px-1.5 py-0.5 rounded font-bold uppercase">{band.bandType}</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-800/50 p-2 rounded-xl">
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Data Richiesta</p>
                          <p className="text-xs font-medium text-slate-200">
                            {req.slotStart ? format(new Date(req.slotStart), 'EEEE dd MMMM', { locale: it }) : "Data non disponibile"}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRequest(req.bookingId, 'accept')}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Accetta
                          </button>
                          <button 
                            onClick={() => handleRequest(req.bookingId, 'reject')}
                            className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <XCircle size={12} /> Rifiuta
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-easygig-accent/5 p-6 rounded-3xl border border-easygig-accent/20">
              <h3 className="font-bold mb-2 text-easygig-accent text-xs uppercase">Legenda Calendario</h3>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Slot Disponibile</li>
                <li className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Richiesta Pendente</li>
                <li className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Evento Confermato</li>
              </ul>
            </div>

            {/* Storico Eventi (per recensioni) */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider mb-6">
                <Clock size={18} className="text-slate-400" /> Eventi Conclusi
              </h3>
              <div className="space-y-4">
                {pastEvents.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic text-center py-4">Nessun evento concluso da recensire.</p>
                ) : (
                  pastEvents.map(event => {
                    const { artist, band } = requestDetails[event.bookingId] || {};
                    return (
                      <div key={event.bookingId} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-xs truncate max-w-[140px]">{band?.name || `${artist?.firstName} ${artist?.lastName}`}</p>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">{event.slotStart && format(new Date(event.slotStart), 'dd MMM')}</p>
                        </div>
                        <button 
                          onClick={() => { setSelectedBookingForReview(event); setIsReviewModalOpen(true); }}
                          className="w-full bg-white/5 hover:bg-easygig-accent text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                        >
                          Recensisci {band ? 'Band' : 'Artista'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Invito Artista */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Gestione Giorno</h3>
                    <p className="text-slate-400 text-sm">
                      {selectedDayForInvite && format(selectedDayForInvite, 'EEEE dd MMMM yyyy', { locale: it })}
                    </p>
                  </div>
                  <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Opzione 1: Slot Libero */}
                  <button 
                    onClick={createFreeSlot}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/5 p-6 rounded-3xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-500">
                        <Plus />
                      </div>
                      <div className="text-left">
                        <p className="font-bold uppercase tracking-wide">Apri Slot Libero</p>
                        <p className="text-xs text-slate-500">Permetti a chiunque di candidarsi</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                  </button>

                  <div className="relative py-4 flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Oppure Invita</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  {/* Opzione 2: Cerca e Invita */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        placeholder="Cerca Band o Artista..." 
                        value={bandSearchQuery}
                        onChange={(e) => setBandSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {isSearchingBands ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="animate-spin text-easygig-accent" />
                        </div>
                      ) : foundBands.length > 0 ? (
                        foundBands.map(band => (
                          <div key={band.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-easygig-accent/20 rounded-full flex items-center justify-center text-easygig-accent font-black">
                                {band.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{band.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tight">{band.genre || "Genere non specificato"}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => inviteBand(band)}
                              className="bg-easygig-accent hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors"
                              title="Invia Invito"
                            >
                              <UserPlus size={18} />
                            </button>
                          </div>
                        ))
                      ) : bandSearchQuery.length > 2 ? (
                        <p className="text-center text-slate-500 text-sm py-8 italic">Nessun artista trovato.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Recensione */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight">Recensisci l'Artista</h3>
                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setReviewRating(star)}><Star size={40} className={star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-slate-700"} /></button>
                  ))}
                </div>
                <textarea rows="4" placeholder="Come si è comportata la band? Puntualità, coinvolgimento..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-easygig-accent" />
                <div className="flex gap-4">
                  <button onClick={() => setIsReviewModalOpen(false)} className="flex-1 bg-white/5 font-bold py-4 rounded-2xl hover:bg-white/10 transition-all">Annulla</button>
                  <button onClick={handleReviewSubmit} className="flex-1 bg-easygig-accent text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all">Invia</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
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

