import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  Music, 
  Calendar, 
  MapPin, 
  Loader2,
  ChevronRight,
  Plus,
  Users,
  LayoutDashboard,
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react';
import * as bookingApi from '../api/bookings';
import * as venueApi from '../api/venues';
import { getBandsByUser, addBand, updateBand, removeBandMember } from '../api/bands';
import * as profileApi from '../api/profile';
import * as reviewApi from '../api/reviews';
import { getErrorMessage } from '../utility/errorHandler';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

import TrackManager from '../components/TrackManager';
import PhotoGallery from '../components/PhotoGallery';
import NotificationCenter from '../components/NotificationCenter';
import UserMenu from '../components/UserMenu';
import GlobalSearch from '../components/GlobalSearch';
import ReviewModal from '../components/ReviewModal';
import CancelModal from '../components/CancelModal';
import DashboardSidebar from '../components/DashboardSidebar';
import StatCard from '../components/StatCard';

export default function ArtistDashboard() {
  const { user } = useAuthStore();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [venueMap, setVenueMap] = useState({});
  const [bands, setBands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isCreateBandModalOpen, setIsCreateBandModalOpen] = useState(false);
  const [isEditBandModalOpen, setIsEditBandModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingBand, setEditingBand] = useState(null);
  
  // Confirm Delete Band Modal State
  const [isConfirmDeleteBandOpen, setIsConfirmDeleteBandOpen] = useState(false);
  const [bandToDeleteId, setBandToDeleteId] = useState(null);
  const [isDeletingBand, setIsDeletingBand] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async ({ rating, comment }) => {
    setIsSubmittingReview(true);
    try {
      await reviewApi.createReview({
        reviewedId: selectedBookingForReview.venueId,
        bookingRequestId: selectedBookingForReview.bookingId,
        rate: rating,
        comment,
        role: 'VENUE'
      }, user.id);
      
      toast.success('Recensione inviata con successo!');
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
      await bookingApi.cancelBookingByUser(user.id, selectedBookingForCancel.bookingId, reason);
      toast.success('Prenotazione annullata con successo');
      setIsCancelModalOpen(false);
      setCancelReason('');
      setSelectedBookingForCancel(null);
      const updatedBookings = await bookingApi.getUserBookings(user.id);
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Errore cancellazione booking:', error);
      toast.error(getErrorMessage(error, 'cancellazione del booking'));
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Create Band State
  const [newBand, setNewBand] = useState({ 
    name: '', 
    description: '',
    cachet: 0, 
    negotiable: true, 
    bandType: 'ORIGINAL', 
    cityId: '', 
    memberIds: [user?.id], 
    genreIds: [] 
  });
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [availableGenres, setAvailableGenres] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userBookings, userBands, genresList] = await Promise.all([
          bookingApi.getUserBookings(user.id),
          getBandsByUser(user.id),
          profileApi.getGenres()
        ]);
        setBookings(userBookings || []);
        setBands(userBands || []);
        setAvailableGenres(genresList || []);

        const bookingsData = Array.isArray(userBookings) ? userBookings : [];
        const uniqueVenueIds = [...new Set(bookingsData.map(b => b.venueId))];
        const venueDetails = await Promise.all(
          uniqueVenueIds.map(id => venueApi.getVenueById(id).catch(() => ({ id, name: `Locale #${id}` })))
        );
        const map = {};
        venueDetails.forEach(v => { map[v.id] = v.name; });
        setVenueMap(map);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleCitySearch = async (val) => {
    setCitySearch(val);
    if (val.length > 2) {
      try {
        const results = await profileApi.searchCities(val);
        setCities(results);
      } catch (err) {
        console.error("City search error:", err);
      }
    }
  };

  const handleCreateBand = async () => {
    try {
      await addBand({ ...newBand, memberIds: [user.id] });
      const updatedBands = await getBandsByUser(user.id);
      setBands(updatedBands);
      toast.success('Band creata con successo!');
      setIsCreateBandModalOpen(false);
      setNewBand({ name: '', description: '', cachet: 0, negotiable: true, bandType: 'ORIGINAL', cityId: '', memberIds: [user.id], genreIds: [] });
      setCitySearch("");
    } catch (error) {
      toast.error(getErrorMessage(error, "creazione della band"));
    }
  };

  const handleUpdateBand = async () => {
    try {
      await updateBand(editingBand.id, {
        ...editingBand,
        memberIds: (Array.isArray(editingBand.members) ? editingBand.members.map(m => m.id) : (editingBand.memberIds || [user.id]))
      });
      const updatedBands = await getBandsByUser(user.id);
      setBands(updatedBands);
      toast.success('Informazioni band aggiornate!');
      setIsEditBandModalOpen(false);
      setEditingBand(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "aggiornamento della band"));
    }
  };

  const handleDeleteBand = async () => {
    if (!bandToDeleteId) return;
    setIsDeletingBand(true);
    try {
      await removeBandMember(bandToDeleteId, user.id, user.id);
      const updatedBands = await getBandsByUser(user.id);
      setBands(updatedBands);
      toast.success('Sei uscito dalla band con successo.');
      setIsConfirmDeleteBandOpen(false);
      setBandToDeleteId(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "rimozione dalla band"));
    } finally {
      setIsDeletingBand(false);
    }
  };

  const refreshBands = async () => {
    try {
      const updatedBands = await getBandsByUser(user.id);
      setBands(updatedBands);
    } catch (error) {
      console.error("Refresh error:", error);
    }
  };

  const handleAddCustomGenre = async (isEditing = false) => {
    if (!customGenre.trim()) return;
    try {
      const genre = await profileApi.createGenre(customGenre.trim());
      if (!availableGenres.find(g => g.id === genre.id)) {
        setAvailableGenres([...availableGenres, genre]);
      }
      
      if (isEditing) {
        const currentIds = editingBand.genreIds || editingBand.genres?.map(g => g.id) || [];
        if (!currentIds.includes(genre.id)) {
          const nextIds = [...currentIds, genre.id];
          setEditingBand({
            ...editingBand, 
            genreIds: nextIds, 
            genres: [...(availableGenres.filter(g => nextIds.includes(g.id))), genre]
          });
        }
      } else {
        const currentIds = newBand.genreIds || [];
        if (!currentIds.includes(genre.id)) {
          setNewBand({...newBand, genreIds: [...currentIds, genre.id]});
        }
      }
      setCustomGenre("");
      toast.success(`Genere "${genre.name}" aggiunto!`);
    } catch (error) {
      toast.error(getErrorMessage(error, "creazione genere"));
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  const upcomingEvents = bookings.filter(b => b.status === 'ACCEPTED' && new Date(b.slotStart) > new Date());

  const sidebarItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', section: 'dashboard', onClick: () => setCurrentSection('dashboard') },
    { icon: <Calendar size={18} />, label: 'I miei Live', section: 'lives', onClick: () => setCurrentSection('lives') },
    { icon: <Users size={18} />, label: 'Band', section: 'bands', onClick: () => setCurrentSection('bands') },
  ];

  return (
    <div className="min-h-screen bg-easygig-dark text-slate-200 flex font-sans selection:bg-indigo-600/30 overflow-x-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <DashboardSidebar navItems={sidebarItems} currentSection={currentSection} />

      {/* Main Content Area */}
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-10 relative z-10">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="badge-indigo mb-1">Pannello Artista</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {currentSection === 'dashboard' ? `Bentornato, ${user?.firstName}` : 
               currentSection === 'lives' ? 'I Miei Live' : 'Gestione Band'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {currentSection === 'dashboard' ? 'Panoramica prenotazioni, date live e formazioni' : 
               currentSection === 'lives' ? 'Storico prenotazioni accettate e passate' : 
               'Gestisci i dettagli e i membri della tua band'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter userId={user?.id} />
            <UserMenu />
          </div>
        </header>
        
        <div className="mb-8">
          <GlobalSearch />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-8 space-y-8">
            
            {currentSection === 'dashboard' && (
              <>
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Live Totali" value={bookings.length} color="from-emerald-500/20 to-emerald-500/5" text="text-emerald-400" />
                  <StatCard label="Prossime Date" value={upcomingEvents.length} color="from-indigo-500/20 to-indigo-500/5" text="text-indigo-400" />
                  <StatCard label="Rating Artista" value={user?.reputation ?? '5.0'} color="from-amber-500/20 to-amber-500/5" text="text-amber-400" />
                </div>

                {/* Live Calendar Preview */}
                <section className="glass-panel p-6 lg:p-8 rounded-2xl">
                  <h2 className="text-lg font-bold text-white tracking-tight mb-6 flex items-center gap-2.5">
                    <Calendar className="text-emerald-400 w-5 h-5" /> Prossimi Live
                  </h2>
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                      Nessun live in programma al momento.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.slice(0, 3).map(event => (
                        <div key={event.bookingId} className="flex items-center gap-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex flex-col items-center justify-center text-emerald-400 shrink-0">
                            <span className="text-[10px] font-bold uppercase">{format(new Date(event.slotStart), 'MMM', { locale: it })}</span>
                            <span className="text-lg font-black leading-none">{format(new Date(event.slotStart), 'dd')}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{venueMap[event.venueId] || `Locale #${event.venueId}`}</h4>
                            <p className="text-[11px] text-slate-400 font-medium">{format(new Date(event.slotStart), 'EEEE d MMMM, HH:mm', { locale: it })}</p>
                          </div>
                          <ChevronRight size={18} className="text-slate-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {currentSection === 'lives' && (
              <section className="glass-panel p-6 lg:p-8 rounded-2xl min-h-[400px]">
                <h2 className="text-lg font-bold text-white tracking-tight mb-6 flex items-center gap-2.5">
                  <Calendar className="text-emerald-400 w-5 h-5" /> I Miei Live
                </h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-16 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center">
                    <div className="bg-slate-800 p-4 rounded-full mb-3 text-slate-500">
                      <Calendar size={36} />
                    </div>
                    <p className="text-sm font-bold text-slate-300">Nessun live prenotato al momento</p>
                    <p className="text-slate-500 text-xs mt-1">Cerca locali ed esplora gli slot per candidarti!</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Prossimi Eventi */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">In Programma</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.filter(b => b.status === 'ACCEPTED' && new Date(b.slotStart) > new Date()).map(event => (
                          <div key={event.bookingId} className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                <Music size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">Booking #{String(event.bookingId).substring(0, 8)}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  CONFERMATO
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1.5 text-xs text-slate-400">
                              <div className="flex items-center gap-2">
                                <Calendar size={13} />
                                <span>{event.slotStart ? format(new Date(event.slotStart), 'dd MMMM yyyy, HH:mm', { locale: it }) : 'Data da definire'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={13} />
                                <span className="font-semibold text-slate-300">{venueMap[event.venueId] || `Locale ID: ${event.venueId}`}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => { setSelectedBookingForCancel(event); setIsCancelModalOpen(true); }}
                              className="w-full mt-4 btn-secondary py-2 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                            >
                              Annulla Prenotazione
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Eventi Conclusi */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Conclusi</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.filter(b => b.status === 'ACCEPTED' && new Date(b.slotStart) <= new Date()).map(event => (
                          <div key={event.bookingId} className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 opacity-90 hover:opacity-100 transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                                  <CheckCircle2 size={20} />
                                </div>
                                <div>
                                  <p className="font-bold text-white text-xs">{venueMap[event.venueId] || `Locale #${event.venueId}`}</p>
                                  <p className="text-[10px] text-slate-400">{format(new Date(event.slotStart), 'dd MMMM yyyy', { locale: it })}</p>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => { setSelectedBookingForReview(event); setIsReviewModalOpen(true); }}
                              className="w-full btn-secondary py-2 text-xs"
                            >
                              Recensisci Locale
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {currentSection === 'bands' && (
              <section className="glass-panel p-6 lg:p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                    <Users className="text-indigo-400 w-5 h-5" /> Le Mie Band
                  </h2>
                  <button 
                    onClick={() => setIsCreateBandModalOpen(true)}
                    className="btn-primary py-2 px-3 text-xs"
                  >
                    <Plus size={16} />
                    <span>Nuova Band</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bands.length === 0 ? (
                    <div className="col-span-2 text-center py-16 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                      <p className="text-slate-400 text-xs italic">Nessuna band creata. Clicca su "+ Nuova Band" per iniziare!</p>
                    </div>
                  ) : (
                    bands.map(band => (
                      <div key={band.id} className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-5 relative group/card">
                        <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-all">
                          <button 
                            onClick={() => { setBandToDeleteId(band.id); setIsConfirmDeleteBandOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Elimina/Lascia Band"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-indigo-600/10 flex items-center justify-center text-indigo-400 shrink-0">
                            {band.profilePhoto ? (
                              <img src={band.profilePhoto} alt={band.name} className="w-full h-full object-cover" />
                            ) : (
                              <Music size={28} />
                            )}
                          </div>
                          <div className="text-right flex-1 ml-3">
                            <h3 className="font-bold text-white text-xl tracking-tight truncate">{band.name}</h3>
                            <div className="flex items-center justify-end gap-1.5 mt-1">
                              <MapPin size={13} className="text-indigo-400" />
                              <span className="text-xs text-slate-400 font-medium">{band.cityName}</span>
                            </div>
                          </div>
                        </div>

                        {band.description && (
                          <p className="text-slate-400 text-xs line-clamp-2 italic">{band.description}</p>
                        )}
                        
                        <button 
                          onClick={() => { 
                            setEditingBand({
                              ...band,
                              cityId: band.cityId,
                              genreIds: band.genreIds || []
                            }); 
                            setCitySearch(band.cityName); 
                            setIsEditBandModalOpen(true); 
                          }}
                          className="w-full btn-secondary py-2 text-xs"
                        >
                          Modifica Informazioni Band
                        </button>

                        <div className="pt-4 border-t border-slate-800">
                          <PhotoGallery type="BAND" id={band.id} onUpdate={refreshBands} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

          </div>

          {/* Right Column Widget Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <h3 className="text-base font-bold text-white tracking-tight mb-2">Ottimizza il Profilo</h3>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">Gli artisti con foto e brani audio caricati ricevono fino al 40% in più di ingaggi dai locali.</p>
              <button 
                onClick={() => {
                  if (bands.length > 0) {
                    setEditingBand(bands[0]);
                    setIsGalleryModalOpen(true);
                  } else {
                    setCurrentSection('bands');
                  }
                }}
                className="btn-primary w-full py-2.5 text-xs"
              >
                Gestisci Galleria
              </button>
            </div>
            
            <TrackManager />
            
            {currentSection !== 'bands' && bands.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl">
                <PhotoGallery type="BAND" id={bands[0].id} onUpdate={refreshBands} />
              </div>
            )}
          </div>

        </div>

        {/* Modal Recensione */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => { setIsReviewModalOpen(false); setSelectedBookingForReview(null); }}
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmittingReview}
          title="Recensisci il Locale"
          placeholder="Com'è stata l'esperienza? Accoglienza, impianto audio, pubblico..."
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

        {/* Confirm Delete Band Modal */}
        <ConfirmModal
          isOpen={isConfirmDeleteBandOpen}
          onClose={() => { setIsConfirmDeleteBandOpen(false); setBandToDeleteId(null); }}
          onConfirm={handleDeleteBand}
          title="Lascia la Band"
          message="Sei sicuro di voler lasciare questa band? Se sei l'ultimo membro, la band verrà eliminata."
          confirmLabel="Conferma Uscita"
          isLoading={isDeletingBand}
        />

      </main>
    </div>
  );
}
