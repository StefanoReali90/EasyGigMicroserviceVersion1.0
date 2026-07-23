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
  Trash2
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
import ReviewModal from '../components/ReviewModal';
import CancelModal from '../components/CancelModal';
import StatCard from '../components/StatCard';

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [venueSlots, setVenueSlots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [requestDetails, setRequestDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  
  // Modal State per la Gestione Slot del Giorno
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedDayForInvite, setSelectedDayForInvite] = useState(null);
  const [selectedSlotForInvite, setSelectedSlotForInvite] = useState(null);
  const [slotStartTime, setSlotStartTime] = useState("20:00");
  const [slotEndTime, setSlotEndTime] = useState("22:00");
  const [bandSearchQuery, setBandSearchQuery] = useState("");
  const [foundBands, setFoundBands] = useState([]);
  const [isSearchingBands, setIsSearchingBands] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const handleCancelBooking = async (reason) => {
    try {
      await bookingApi.cancelBookingByVenue(user.id, selectedBookingForCancel.bookingId, reason);
      setIsCancelModalOpen(false);
      setCancelReason('');
      setSelectedBookingForCancel(null);
      refreshData();
    } catch (error) {
      console.error('Errore cancellazione booking direttore:', error);
      alert(getErrorMessage(error, 'cancellazione del booking'));
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // La logica isLateCancellation è ora gestita internamente da CancelModal

  // Bulk Slot Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    days: [false, false, false, false, false, true, true], // Fri, Sat by default
    startTime: "21:00"
  });

  // Add Venue Modal State
  const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
  const [newVenueData, setNewVenueData] = useState({
    name: "",
    phone: "",
    capacity: "",
    type: "STANDING",
    equipment: "",
    street: "",
    houseNumber: "",
    zipCode: "",
    cityId: ""
  });
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const handleAddVenue = async (e) => {
    e.preventDefault();
    try {
      await profileApi.createVenueProfile({
        ...newVenueData,
        directorId: user.id
      });
      setIsAddVenueModalOpen(false);
      setNewVenueData({
        name: "", phone: "", capacity: "", type: "STANDING", equipment: "",
        street: "", houseNumber: "", zipCode: "", cityId: ""
      });
      setCitySearch("");
      setSelectedCity(null);
      
      // Refresh venues list
      const data = await venueApi.getVenuesByDirector(user.id);
      setVenues(data);
      if (data.length > 0 && !selectedVenue) setSelectedVenue(data[0]);
      
      alert("Locale aggiunto con successo!");
    } catch (error) {
      console.error("Errore aggiunta locale:", error);
      alert(getErrorMessage(error, "aggiunta del locale"));
    }
  };

  // Cerca città per la nuova venue
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (citySearch.length > 2 && !selectedCity) {
        setIsSearchingCities(true);
        try {
          const data = await profileApi.searchCities(citySearch);
          setCities(data);
        } catch (error) {
          console.error("Errore ricerca città:", error);
        } finally {
          setIsSearchingCities(false);
        }
      } else {
        setCities([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [citySearch, selectedCity]);


  const handleBulkCreate = async () => {
    if (!selectedVenue) return;
    setIsLoading(true);
    try {
      const start = new Date(bulkConfig.startDate);
      const end = new Date(bulkConfig.endDate);
      let current = new Date(start);
      
      const promises = [];
      while (current <= end) {
        const dayOfWeek = (current.getDay() + 6) % 7; // Map 0 (Sun) to 6, 1 (Mon) to 0
        // Wait, standard getDay() is 0=Sun, 1=Mon... 5=Fri, 6=Sat.
        // My array is [Mon, Tue, Wed, Thu, Fri, Sat, Sun]? Let's fix.
        // Let's use 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        
        const daysIndices = [1, 2, 3, 4, 5, 6, 0]; // Mon to Sun
        const isSelected = bulkConfig.days[daysIndices.indexOf(current.getDay())];
        
        if (isSelected) {
          const slotStart = new Date(current);
          const [h, m] = bulkConfig.startTime.split(':');
          slotStart.setHours(parseInt(h), parseInt(m), 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(slotEnd.getHours() + 3); // Default 3 hours

          promises.push(slotApi.createSlot({
            venueId: selectedVenue.id,
            start: format(slotStart, "yyyy-MM-dd'T'HH:mm:ss"),
            end: format(slotEnd, "yyyy-MM-dd'T'HH:mm:ss")
          }));
        }
        current = addDays(current, 1);
      }
      
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      let msg = `${successCount} slot creati con successo.`;
      if (failCount > 0) {
        msg += `\n${failCount} slot saltati (probabilmente già esistenti in quelle date).`;
      }
      
      alert(msg);
      setIsBulkModalOpen(false);
      refreshData();
    } catch (error) {
      console.error("Errore creazione massiva:", error);
      alert("Si è verificato un errore critico durante la creazione massiva.");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (user) {
      fetchVenues();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // 2. Carica la disponibilità e le richieste quando cambia mese o locale
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedVenue) return;
      try {
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        
        const [calData, reqData, allBookings, slotsData] = await Promise.all([
          slotApi.getCalendar(selectedVenue.id, month, year),
          bookingApi.getVenueRequests(selectedVenue.id),
          bookingApi.getVenueRequests(selectedVenue.id, 'ACCEPTED'),
          slotApi.getSlotsByVenue(selectedVenue.id).catch(() => [])
        ]);
        
        setCalendarData(calData.calendarColors || {});
        setRequests(reqData);
        setVenueSlots(slotsData || []);
        
        const now = new Date();
        const upcoming = allBookings.filter(b => new Date(b.slotStart || b.createdAt) >= now);
        const past = allBookings.filter(b => new Date(b.slotStart || b.createdAt) < now);
        
        setUpcomingEvents(upcoming);
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

  const handleToggleSlot = (day) => {
    if (!selectedVenue) return;
    setSelectedDayForInvite(day);
    setSelectedSlotForInvite(null);
    setIsInviteModalOpen(true);
  };

  const handleAddSlotForDay = async () => {
    if (!selectedDayForInvite || !selectedVenue) return;
    try {
      const [startH, startM] = slotStartTime.split(':');
      const [endH, endM] = slotEndTime.split(':');

      const start = new Date(selectedDayForInvite);
      start.setHours(parseInt(startH || '20'), parseInt(startM || '00'), 0, 0);

      const end = new Date(selectedDayForInvite);
      end.setHours(parseInt(endH || '22'), parseInt(endM || '00'), 0, 0);

      if (end <= start) {
        alert("L'ora di fine dello slot deve essere successiva all'ora di inizio.");
        return;
      }

      const dateStr = format(selectedDayForInvite, 'yyyy-MM-dd');
      const daySlots = venueSlots.filter(s => s.start && s.start.startsWith(dateStr));
      const hasOverlap = daySlots.some(s => {
        const sStart = new Date(s.start);
        const sEnd = new Date(s.end);
        return start < sEnd && end > sStart;
      });

      if (hasOverlap) {
        alert("Esiste già uno slot che si sovrappone a questo orario per il giorno selezionato!");
        return;
      }

      await slotApi.createSlot({
        venueId: selectedVenue.id,
        start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
        end: format(end, "yyyy-MM-dd'T'HH:mm:ss")
      });

      refreshData();
    } catch (error) {
      console.error("Errore creazione slot:", error);
      alert(getErrorMessage(error, "creazione dello slot"));
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await slotApi.deleteSlot(slotId);
      refreshData();
    } catch (error) {
      console.error("Errore eliminazione slot:", error);
      alert(getErrorMessage(error, "eliminazione dello slot"));
    }
  };

  const inviteBandToSlot = async (band, slotId) => {
    try {
      const targetUserId = band.userId || band.id;
      await bookingApi.inviteArtist(selectedVenue.id, targetUserId, slotId);
      alert(`Invito inviato con successo alla band ${band.name}!`);
      setSelectedSlotForInvite(null);
      setBandSearchQuery('');
      refreshData();
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
      alert(getErrorMessage(error, "gestione della richiesta"));
    }
  };

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async ({ rating, comment }) => {
    setIsSubmittingReview(true);
    try {
      await reviewApi.createReview({
        reviewedId: selectedBookingForReview.userId,
        bookingRequestId: selectedBookingForReview.bookingId,
        rate: rating,
        comment,
        role: 'ARTIST'
      }, user.id);
      
      alert('Recensione inviata!');
      setIsReviewModalOpen(false);
      setSelectedBookingForReview(null);
      refreshData();
    } catch (error) {
      console.error('Errore invio recensione:', error);
      alert(getErrorMessage(error, 'invio della recensione'));
    } finally {
      setIsSubmittingReview(false);
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
    if (!selectedVenue) return;
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const [calData, reqData, allBookings, slotsData] = await Promise.all([
      slotApi.getCalendar(selectedVenue.id, month, year),
      bookingApi.getVenueRequests(selectedVenue.id),
      bookingApi.getVenueRequests(selectedVenue.id, 'ACCEPTED'),
      slotApi.getSlotsByVenue(selectedVenue.id).catch(() => [])
    ]);
    setCalendarData(calData.calendarColors || {});
    setRequests(reqData);
    setVenueSlots(slotsData || []);
    const now = new Date();
    setUpcomingEvents(allBookings.filter(b => new Date(b.slotStart || b.createdAt) >= now));
    setPastEvents(allBookings.filter(b => new Date(b.slotStart || b.createdAt) < now));
  };

  const renderHeader = () => {
    return (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Landmark className="text-easygig-accent" size={28} />
              <h2 className="text-3xl font-black tracking-tight uppercase">Gestione Locale</h2>
            </div>
            {selectedVenue ? (
              <div className="flex items-center gap-2">
                <p className="text-slate-400 font-medium">Stai gestendo:</p>
                <select 
                  className="bg-white/5 border-none text-easygig-accent font-black focus:ring-0 cursor-pointer"
                  value={selectedVenue.id}
                  onChange={(e) => setSelectedVenue(venues.find(v => v.id === parseInt(e.target.value)))}
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id} className="bg-slate-900">{v.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">Nessun locale selezionato</p>
            )}
            <button 
              onClick={() => setIsAddVenueModalOpen(true)}
              className="mt-2 flex items-center gap-1.5 text-easygig-accent hover:text-indigo-400 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Plus size={12} /> Aggiungi Locale
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="hidden md:flex items-center gap-2 bg-easygig-accent/10 hover:bg-easygig-accent text-easygig-accent hover:text-white px-5 py-2.5 rounded-2xl border border-easygig-accent/20 transition-all font-bold text-xs uppercase tracking-widest"
            >
              <Plus size={16} /> Apri Slot Multipli
            </button>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ChevronLeft />
              </button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Warning se non ci sono locali */}
        {venues.length === 0 && !isLoading && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[3rem] mb-12 flex flex-col items-center text-center gap-6 animate-pulse">
             <div className="p-4 bg-amber-500/20 rounded-3xl text-amber-500">
                <Landmark size={48} />
             </div>
             <div className="max-w-md">
                <h3 className="text-xl font-black uppercase tracking-tight text-amber-500 mb-2">Nessun locale associato</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sembra che tu non abbia ancora creato un locale o che l'associazione non sia andata a buon fine. 
                  Senza un locale non puoi gestire slot o ricevere prenotazioni.
                </p>
             </div>
             <Link to="/profile/edit" className="bg-amber-500 text-slate-900 font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-amber-400 transition-all">
                Configura Profilo
             </Link>
          </div>
        )}
      </>
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
    let day = startDate;

    while (day <= endDate) {
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const cellDay = new Date(day);
        const formattedDate = format(cellDay, 'yyyy-MM-dd');
        const daySlots = venueSlots.filter(s => s.start && s.start.startsWith(formattedDate));
        const status = calendarData[formattedDate];
        const isSelected = isSameDay(cellDay, new Date());
        const isCurrentMonth = isSameMonth(cellDay, monthStart);

        const hasAvailable = daySlots.some(s => s.state === 'AVAILABLE');
        const hasPending = daySlots.some(s => s.state === 'PENDING');
        const hasBooked = daySlots.some(s => s.state === 'BOOKED');

        weekDays.push(
          <div
            key={cellDay.getTime()}
            onClick={() => {
              if (isCurrentMonth) {
                handleToggleSlot(cellDay);
              }
            }}
            className={`relative h-32 border border-slate-800/80 p-2 transition-all cursor-pointer group flex flex-col justify-between
              ${!isCurrentMonth ? 'opacity-20 cursor-default pointer-events-none' : 'hover:bg-slate-800/40'}
              ${daySlots.length > 0 ? (hasAvailable ? 'bg-emerald-500/5' : hasPending ? 'bg-amber-500/5' : 'bg-rose-500/5') : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isSelected ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-sm' : 'text-slate-300'}`}>
                {format(cellDay, 'd')}
              </span>
              
              {daySlots.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {daySlots.length} {daySlots.length === 1 ? 'Slot' : 'Slot'}
                </span>
              )}
            </div>
            
            {daySlots.length > 0 ? (
              <div className="space-y-1 my-1">
                {daySlots.slice(0, 2).map((slot) => {
                  const startTime = format(new Date(slot.start), 'HH:mm');
                  const endTime = format(new Date(slot.end), 'HH:mm');
                  return (
                    <div 
                      key={slot.id} 
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center justify-between ${
                        slot.state === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        slot.state === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      <span>{startTime} - {endTime}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        slot.state === 'AVAILABLE' ? 'bg-emerald-400' :
                        slot.state === 'PENDING' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                    </div>
                  );
                })}
                {daySlots.length > 2 && (
                  <p className="text-[9px] text-slate-500 font-medium text-center">+{daySlots.length - 2} altri slot</p>
                )}
              </div>
            ) : (
              status && (
                <div className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                  status === 'green' ? 'text-emerald-400 bg-emerald-400/10' : status === 'yellow' ? 'text-amber-400 bg-amber-400/10' : 'text-rose-400 bg-rose-400/10'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${status === 'green' ? 'bg-emerald-400' : status === 'yellow' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  {status === 'green' ? 'Libero' : status === 'yellow' ? 'In Attesa' : 'Occupato'}
                </div>
              )
            )}

            {isCurrentMonth && daySlots.length === 0 && !status && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="text-indigo-400" size={20} />
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.getTime()}>
          {weekDays}
        </div>
      );
    }
    return <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-studio">{rows}</div>;
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
          <StatCard 
            label="Eventi Conclusi" 
            value={pastEvents.length} 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            trend="+12% questo mese"
          />
          <StatCard 
            label="Richieste Pendenti" 
            value={requests.length} 
            icon={<Clock className="text-amber-500" />} 
            trend="Risposta media: 2h"
          />
          <StatCard 
            label="Occupazione" 
            value={`${Math.round((Object.values(calendarData).filter(v => v === 'red').length / 30) * 100)}%`} 
            icon={<Landmark className="text-indigo-500" />} 
            trend="Basato sul mese corrente"
          />
          <StatCard 
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

            {/* Prossimi Eventi Confermati */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider mb-6">
                <CheckCircle2 size={18} className="text-emerald-500" /> Prossimi Live
              </h3>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic text-center py-4">Nessun evento confermato.</p>
                ) : (
                  upcomingEvents.map(event => {
                    const { artist, band } = requestDetails[event.bookingId] || {};
                    return (
                      <div key={event.bookingId} className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex flex-col gap-3 group hover:border-emerald-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-xs uppercase tracking-tighter text-white">{band?.name || `${artist?.firstName} ${artist?.lastName}`}</p>
                            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">
                               {event.slotStart && format(new Date(event.slotStart), 'dd MMMM, HH:mm', { locale: it })}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedBookingForCancel(event); setIsCancelModalOpen(true); }}
                          className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <X size={12} /> Annulla Evento
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
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

        {/* Modal: Gestione Slot del Giorno (1 Slot = 1 Band) */}
        {isInviteModalOpen && selectedDayForInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8">
                
                {/* Header Modale */}
                <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                  <div>
                    <span className="badge-indigo mb-1">1 Slot = 1 Esibizione Band</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Gestione Slot del Giorno
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {format(selectedDayForInvite, 'EEEE d MMMM yyyy', { locale: it })}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setIsInviteModalOpen(false); setSelectedSlotForInvite(null); }} 
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* --- LISTA SLOT ESISTENTI NEL GIORNO --- */}
                <div className="space-y-4 mb-8">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Slot Presenti ({venueSlots.filter(s => s.start && s.start.startsWith(format(selectedDayForInvite, 'yyyy-MM-dd'))).length})
                  </h4>

                  {venueSlots.filter(s => s.start && s.start.startsWith(format(selectedDayForInvite, 'yyyy-MM-dd'))).length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
                      <p className="text-xs text-slate-400">Nessuno slot aperto per questa giornata.</p>
                      <p className="text-[11px] text-slate-500 mt-1">Utilizza il form qui sotto per aggiungere il primo slot per una band.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {venueSlots
                        .filter(s => s.start && s.start.startsWith(format(selectedDayForInvite, 'yyyy-MM-dd')))
                        .map((slot) => {
                          const startTimeStr = format(new Date(slot.start), 'HH:mm');
                          const endTimeStr = format(new Date(slot.end), 'HH:mm');
                          const isAvailable = slot.state === 'AVAILABLE';
                          const isPending = slot.state === 'PENDING';

                          return (
                            <div key={slot.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">
                                      {startTimeStr} — {endTimeStr}
                                    </p>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isAvailable ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-rose-400'}`}>
                                      {isAvailable ? 'Libero (In attesa di candidature)' : isPending ? 'Richiesta Pendente' : 'Prenotato / Confermato'}
                                    </span>
                                  </div>
                                </div>

                                {isAvailable && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setSelectedSlotForInvite(selectedSlotForInvite?.id === slot.id ? null : slot)}
                                      className="btn-secondary py-1.5 px-3 text-xs"
                                    >
                                      <UserPlus className="w-3.5 h-3.5" />
                                      <span>Invita Band</span>
                                    </button>

                                    <button
                                      onClick={() => handleDeleteSlot(slot.id)}
                                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                      title="Elimina Slot"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Panel Invita Band specifico per questo Slot */}
                              {selectedSlotForInvite?.id === slot.id && (
                                <div className="mt-2 pt-3 border-t border-slate-800 space-y-3 animate-fade-in">
                                  <p className="text-xs font-semibold text-indigo-400">Invita una band specifica per lo slot {startTimeStr} - {endTimeStr}:</p>
                                  <div className="relative">
                                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                                    <input
                                      type="text"
                                      placeholder="Cerca band per nome..."
                                      value={bandSearchQuery}
                                      onChange={(e) => setBandSearchQuery(e.target.value)}
                                      className="input-studio pl-10 w-full text-xs"
                                    />
                                  </div>

                                  {isSearchingBands ? (
                                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-400" /></div>
                                  ) : foundBands.length > 0 ? (
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                      {foundBands.map(b => (
                                        <div key={b.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                                          <div>
                                            <p className="font-bold text-white">{b.name}</p>
                                            <p className="text-[10px] text-slate-400">{b.genre || 'Genere non specificato'}</p>
                                          </div>
                                          <button
                                            onClick={() => inviteBandToSlot(b, slot.id)}
                                            className="btn-primary py-1 px-2.5 text-[11px]"
                                          >
                                            Invia Invito
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* --- FORM CREAZIONE NUOVO SLOT NEL GIORNO --- */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-400" /> Aggiungi un altro Slot (1 Slot = 1 Band)
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Ora Inizio</label>
                      <input
                        type="time"
                        value={slotStartTime}
                        onChange={(e) => setSlotStartTime(e.target.value)}
                        className="input-studio w-full"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Ora Fine</label>
                      <input
                        type="time"
                        value={slotEndTime}
                        onChange={(e) => setSlotEndTime(e.target.value)}
                        className="input-studio w-full"
                      />
                    </div>

                    <button
                      onClick={handleAddSlotForDay}
                      className="btn-primary w-full py-3 text-xs col-span-2 sm:col-span-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Crea Slot</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Modal Recensione Artista - componente condiviso */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => { setIsReviewModalOpen(false); setSelectedBookingForReview(null); }}
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmittingReview}
          title="Recensisci l'Artista"
          placeholder="Come si è comportata la band? Puntualità, coinvolgimento del pubblico..."
        />

        {/* Modal Cancellazione Evento - componente condiviso */}
        <CancelModal
          isOpen={isCancelModalOpen}
          onClose={() => { setIsCancelModalOpen(false); setSelectedBookingForCancel(null); setCancelReason(''); }}
          onConfirm={handleCancelBooking}
          cancelReason={cancelReason}
          onReasonChange={setCancelReason}
          slotStart={selectedBookingForCancel?.slotStart}
          isSubmitting={isSubmittingCancel}
          title="Annulla Evento"
          lateWarningMessage="Mancano meno di 48 ore all'evento. Come Direttore Artistico, il tuo locale riceverà automaticamente 1 STRIKE sulla reputazione."
          confirmLabel="Conferma Annullamento"
        />

        {/* Modal: Creazione Massiva Slot */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)]">
              <div className="p-12">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className="bg-indigo-500/20 p-4 rounded-3xl text-indigo-400">
                       <CalendarIcon size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tight">Programmazione Rapida</h3>
                      <p className="text-slate-400 font-medium">Configura una serie di slot ricorrenti</p>
                    </div>
                  </div>
                  <button onClick={() => setIsBulkModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-all">
                    <X size={28} />
                  </button>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data Inizio</label>
                      <input 
                        type="date" 
                        value={bulkConfig.startDate}
                        onChange={(e) => setBulkConfig({...bulkConfig, startDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data Fine</label>
                      <input 
                        type="date" 
                        value={bulkConfig.endDate}
                        onChange={(e) => setBulkConfig({...bulkConfig, endDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giorni Attivi</label>
                    <div className="flex justify-between gap-2">
                      {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day, idx) => (
                        <button
                          key={day}
                          onClick={() => {
                            const newDays = [...bulkConfig.days];
                            newDays[idx] = !newDays[idx];
                            setBulkConfig({...bulkConfig, days: newDays});
                          }}
                          className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                            ${bulkConfig.days[idx] 
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                              : 'bg-white/5 text-slate-500 hover:bg-white/10'}
                          `}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Orario Inizio Standard</label>
                    <input 
                      type="time" 
                      value={bulkConfig.startTime}
                      onChange={(e) => setBulkConfig({...bulkConfig, startTime: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={() => setIsBulkModalOpen(false)}
                      className="flex-1 bg-white/5 font-black py-6 rounded-3xl uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                    >
                      Annulla
                    </button>
                    <button 
                      onClick={handleBulkCreate}
                      className="flex-1 bg-gradient-premium text-white font-black py-6 rounded-3xl uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Genera Calendario
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      {/* Modale Aggiunta Locale */}
      {isAddVenueModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsAddVenueModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Nuovo Locale</h3>
                  <p className="text-slate-400 text-sm font-medium">Registra una nuova location da gestire</p>
                </div>
                <button onClick={() => setIsAddVenueModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddVenue} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome Locale</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all"
                      value={newVenueData.name}
                      onChange={(e) => setNewVenueData({...newVenueData, name: e.target.value})}
                      placeholder="Es: Blue Note"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Telefono</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all"
                      value={newVenueData.phone}
                      onChange={(e) => setNewVenueData({...newVenueData, phone: e.target.value})}
                      placeholder="+39 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Capienza</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all"
                      value={newVenueData.capacity}
                      onChange={(e) => setNewVenueData({...newVenueData, capacity: e.target.value})}
                      placeholder="150"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo Posti</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none appearance-none"
                      value={newVenueData.type}
                      onChange={(e) => setNewVenueData({...newVenueData, type: e.target.value})}
                    >
                      <option value="STANDING" className="bg-slate-900 text-white">Solo in piedi</option>
                      <option value="SEATED" className="bg-slate-900 text-white">Solo seduti</option>
                      <option value="TABLES" className="bg-slate-900 text-white">Tavoli</option>
                      <option value="MIXED" className="bg-slate-900 text-white">Misto</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Via</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none"
                      value={newVenueData.street}
                      onChange={(e) => setNewVenueData({...newVenueData, street: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Civico</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none"
                      value={newVenueData.houseNumber}
                      onChange={(e) => setNewVenueData({...newVenueData, houseNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">CAP</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none"
                      value={newVenueData.zipCode}
                      onChange={(e) => setNewVenueData({...newVenueData, zipCode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Città</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 pl-10 outline-none"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        if (selectedCity) setSelectedCity(null);
                      }}
                      placeholder="Cerca città..."
                    />
                    <MapPin className="absolute left-3 top-3.5 text-slate-500" size={16} />
                    {isSearchingCities && <Loader2 className="absolute right-3 top-3.5 text-easygig-accent animate-spin" size={16} />}
                  </div>
                  {cities.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {cities.map(city => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setCitySearch(city.name);
                            setNewVenueData({...newVenueData, cityId: city.id});
                            setCities([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-easygig-accent/20 transition-colors border-b border-white/5 last:border-none"
                        >
                          <span className="text-sm font-medium">{city.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Attrezzatura</label>
                  <textarea 
                    required
                    rows="3"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none"
                    value={newVenueData.equipment}
                    onChange={(e) => setNewVenueData({...newVenueData, equipment: e.target.value})}
                    placeholder="Descrivi l'impianto audio/luci..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-easygig-accent hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest text-xs mt-4"
                >
                  Salva Locale
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

// StatCard è ora importato da components/StatCard.jsx
