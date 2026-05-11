import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  Music, 
  Calendar, 
  MapPin, 
  Star, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Plus,
  Users,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Bell,
  MoreVertical,
  Trash2,
  X
} from 'lucide-react';
import * as bookingApi from '../api/bookings';
import * as venueApi from '../api/venues';
import { getBandsByUser, addBand, updateBand, removeBandMember } from '../api/bands';
import * as profileApi from '../api/profile';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utility/errorHandler';

import TrackManager from '../components/TrackManager';
import PhotoGallery from '../components/PhotoGallery';
import NotificationCenter from '../components/NotificationCenter';
import UserMenu from '../components/UserMenu';
import GlobalSearch from '../components/GlobalSearch';


export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [venueMap, setVenueMap] = useState({}); // {venueId: venueName}
  const [bands, setBands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('dashboard'); // 'dashboard', 'lives', 'bands'
  const [isCreateBandModalOpen, setIsCreateBandModalOpen] = useState(false);
  const [isEditBandModalOpen, setIsEditBandModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingBand, setEditingBand] = useState(null);

  
  // Create Band State
  const [newBand, setNewBand] = useState({ 
    name: '', 
    description: '',
    cachet: 0, 
    negotiable: true, 
    bandType: 'ORIGINAL', 
    cityId: '', 
    memberIds: [user.id], 
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
        setBookings(userBookings);
        setBands(userBands);
        setAvailableGenres(genresList);

        // Fetch venue names for bookings
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
    if (user) fetchData();
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
      setIsCreateBandModalOpen(false);
      setNewBand({ name: '', description: '', cachet: 0, negotiable: true, bandType: 'ORIGINAL', cityId: '', memberIds: [user.id], genreIds: [] });
      setCitySearch("");
    } catch (error) {
      alert(getErrorMessage(error, "creazione della band"));
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
      setIsEditBandModalOpen(false);
      setEditingBand(null);
    } catch (error) {
      alert(getErrorMessage(error, "aggiornamento della band"));
    }
  };

  const handleDeleteBand = async (bandId) => {
    if (!window.confirm("Sei sicuro di voler lasciare questa band? Se sei l'ultimo membro, la band verrà eliminata.")) return;
    try {
      if (typeof removeBandMember !== 'function') {
        throw new Error("La funzione di rimozione non è caricata correttamente. Riprova tra un istante.");
      }
      await removeBandMember(bandId, user.id, user.id);
      const updatedBands = await getBandsByUser(user.id);
      setBands(updatedBands);
    } catch (error) {
      alert(getErrorMessage(error, "rimozione dalla band"));
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
      // Aggiungiamo alla lista dei generi disponibili se non c'è già
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
    } catch (error) {
      alert(getErrorMessage(error, "creazione genere"));
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center">
      <Loader2 className="animate-spin text-easygig-accent" size={48} />
    </div>
  );

  const upcomingEvents = bookings.filter(b => b.status === 'ACCEPTED' && new Date(b.slotStart) > new Date());

  return (
    <div className="min-h-screen bg-easygig-dark text-slate-200 flex font-sans selection:bg-easygig-accent/30 overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-easygig-card/50 backdrop-blur-xl flex flex-col items-center lg:items-start py-8 px-4 fixed h-full z-40 transition-all">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Music className="text-white" size={20} />
          </div>
          <span className="hidden lg:block font-black text-xl tracking-tighter text-white">EASYGIG</span>
        </div>

        <nav className="flex-1 w-full space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={currentSection === 'dashboard'} 
            onClick={() => setCurrentSection('dashboard')} 
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="I miei Live" 
            active={currentSection === 'lives'} 
            onClick={() => setCurrentSection('lives')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Band" 
            active={currentSection === 'bands'} 
            onClick={() => setCurrentSection('bands')} 
          />
          <NavItem icon={<MessageSquare size={20} />} label="Messaggi" onClick={() => navigate('/messages')} />
        </nav>


        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-white transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span className="hidden lg:block font-bold text-sm uppercase tracking-wider">Logout</span>
        </button>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-10">
        
        {/* Top Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              {currentSection === 'dashboard' ? `Bentornato, ${user?.firstName}` : 
               currentSection === 'lives' ? 'I Miei Live' : 'Gestione Band'}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              {currentSection === 'dashboard' ? 'Ecco cosa sta succedendo oggi.' : 
               currentSection === 'lives' ? 'Controlla le tue prenotazioni confermate e passate.' : 
               'Gestisci le tue formazioni musicali.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter userId={user?.id} />
            <UserMenu />
          </div>
        </header>
        
        <div className="mb-10">
          <GlobalSearch />
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-8 space-y-8">
            
            {currentSection === 'dashboard' && (
              <>
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Live Totali" value={bookings.length} color="from-emerald-500/20 to-emerald-500/5" text="text-emerald-500" />
                  <StatCard label="Prossime Date" value={upcomingEvents.length} color="from-easygig-accent/20 to-easygig-accent/5" text="text-easygig-accent" />
                  <StatCard label="Rating" value={user?.reputation || "5.0"} color="from-amber-500/20 to-amber-500/5" text="text-amber-500" />
                </div>

                {/* Live Calendar Preview */}
                <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 lg:p-8">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                    <Calendar className="text-emerald-500" /> Prossimi Live
                  </h2>
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 italic bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
                      Nessun live in programma al momento.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(Array.isArray(upcomingEvents) ? upcomingEvents : []).slice(0, 3).map(event => (
                        <div key={event.bookingId} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                          <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex flex-col items-center justify-center text-emerald-500">
                            <span className="text-xs font-bold uppercase">{format(new Date(event.slotStart), 'MMM', { locale: it })}</span>
                            <span className="text-xl font-black leading-none">{format(new Date(event.slotStart), 'dd')}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white uppercase tracking-tight">{venueMap[event.venueId] || `Locale #${event.venueId}`}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{format(new Date(event.slotStart), 'EEEE dd MMMM, HH:mm', { locale: it })}</p>
                          </div>
                          <ChevronRight size={20} className="text-slate-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {currentSection === 'lives' && (
              <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 lg:p-8 min-h-[400px]">
                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Calendar className="text-emerald-500" /> Elenco Completo Live
                </h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                    <div className="bg-white/5 p-6 rounded-full mb-4">
                      <Calendar size={48} className="text-slate-700" />
                    </div>
                    <p className="text-xl font-bold text-slate-400">Nessun live prenotato al momento</p>
                    <p className="text-slate-600 text-sm mt-2">Inizia a cercare locali e candidati per suonare!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Array.isArray(bookings) ? bookings : []).map(event => (
                      <div key={event.bookingId} className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${event.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            <Music size={24} />
                          </div>
                          <div>
                            <p className="font-black text-white uppercase tracking-tighter">Booking #{event.bookingId.substring(0, 8)}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${event.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-400'}`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={14} />
                            <span className="text-xs font-medium">{event.slotStart ? format(new Date(event.slotStart), 'dd MMMM yyyy, HH:mm', { locale: it }) : 'Data da definire'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin size={14} />
                            <span className="text-xs font-medium uppercase tracking-tight">{venueMap[event.venueId] || `Locale ID: ${event.venueId}`}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {currentSection === 'bands' && (
              <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Users className="text-easygig-accent" /> Le Mie Band
                  </h2>
                  <button 
                    onClick={() => setIsCreateBandModalOpen(true)}
                    className="bg-easygig-accent hover:bg-easygig-accent/80 text-white p-2 rounded-xl transition-all shadow-lg shadow-easygig-accent/20"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bands.length === 0 ? (
                    <div className="col-span-2 text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
                      <p className="text-slate-500 italic">Ancora nessuna band. Clicca sul + per iniziare!</p>
                    </div>
                  ) : (
                    (Array.isArray(bands) ? bands : []).map(band => (
                      <div key={band.id} className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 space-y-6 relative group/card">
                        <div className="absolute top-6 right-6 opacity-0 group-hover/card:opacity-100 transition-all">
                          <button 
                            onClick={() => handleDeleteBand(band.id)}
                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                            title="Elimina/Lascia Band"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="w-16 h-16 rounded-3xl overflow-hidden border border-white/10 bg-easygig-accent/10 flex items-center justify-center text-easygig-accent shadow-inner flex-shrink-0">
                            {band.profilePhoto ? (
                              <img src={band.profilePhoto} alt={band.name} className="w-full h-full object-cover" />
                            ) : (
                              <Music size={32} />
                            )}
                          </div>
                          <div className="text-right flex-1 ml-4">
                            <h3 className="font-black text-white text-2xl uppercase tracking-tighter truncate">{band.name}</h3>
                            <div className="flex items-center justify-end gap-2 mt-1">
                              <MapPin size={14} className="text-easygig-accent" />
                              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{band.cityName}</span>
                            </div>
                          </div>
                        </div>

                        {band.description && (
                          <p className="text-slate-400 text-sm line-clamp-2 italic">{band.description}</p>
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
                          className="w-full bg-white/5 hover:bg-easygig-accent text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-all border border-white/10"
                        >
                          Modifica Informazioni Band
                        </button>

                        <div className="pt-6 border-t border-white/5">
                          <PhotoGallery type="BAND" id={band.id} onUpdate={refreshBands} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

          </div>

          <div className="xl:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-easygig-accent/20 to-purple-500/20 p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <TrendingUp className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" size={120} />
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Ottimizza il Profilo</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Gli artisti con foto e tracce aggiornate hanno il 40% in più di possibilità di essere ingaggiati.</p>
              <button 
                onClick={() => {
                  if (bands.length > 0) {
                    setEditingBand(bands[0]);
                    setIsGalleryModalOpen(true);
                  } else {
                    setCurrentSection('bands');
                  }
                }}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl uppercase tracking-wider text-xs hover:bg-easygig-accent hover:text-white transition-all"
              >
                Gestisci Galleria
              </button>
            </div>
            
            <TrackManager />
            
            {currentSection !== 'bands' && bands.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
                <PhotoGallery type="BAND" id={bands[0].id} onUpdate={refreshBands} />
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Create Band Modal */}
      {isCreateBandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1a1d23] border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Crea Nuova Band</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nome Band</label>
                <input 
                  type="text" 
                  value={newBand.name} 
                  onChange={(e) => setNewBand({...newBand, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-easygig-accent outline-none" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Descrizione / Bio</label>
                <textarea 
                  value={newBand.description} 
                  onChange={(e) => setNewBand({...newBand, description: e.target.value})}
                  rows="3"
                  placeholder="Raccontaci della vostra band..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-easygig-accent outline-none resize-none" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Cachet Base (€)</label>
                  <input 
                    type="number" 
                    value={newBand.cachet} 
                    onChange={(e) => setNewBand({...newBand, cachet: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tipo Band</label>
                  <select 
                    value={newBand.bandType}
                    onChange={(e) => setNewBand({...newBand, bandType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none"
                  >
                    <option value="ORIGINAL">Originale</option>
                    <option value="COVER">Cover</option>
                    <option value="TRIBUTE">Tribute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Città</label>
                <input 
                  type="text" 
                  placeholder="Cerca città..."
                  value={citySearch}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none mb-2" 
                />
                {cities.length > 0 && (
                  <div className="bg-[#252a33] border border-white/10 rounded-xl max-h-40 overflow-y-auto">
                    {(Array.isArray(cities) ? cities : []).map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => { setNewBand({...newBand, cityId: c.id}); setCitySearch(c.name); setCities([]); }}
                        className="w-full text-left px-4 py-2 hover:bg-easygig-accent/20 text-sm"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Generi Musicali</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Array.isArray(availableGenres) ? availableGenres : []).length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">Nessun genere caricato. Assicurati che il backend sia avviato correttamente.</p>
                  ) : (
                    (Array.isArray(availableGenres) ? availableGenres : []).map(genre => (
                      <button
                        key={genre.id}
                        onClick={() => {
                          const current = newBand.genreIds || [];
                          if (current.includes(genre.id)) {
                            setNewBand({...newBand, genreIds: current.filter(id => id !== genre.id)});
                          } else {
                            setNewBand({...newBand, genreIds: [...current, genre.id]});
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          (newBand.genreIds || []).includes(genre.id) 
                            ? 'bg-easygig-accent text-white' 
                            : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/20'
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Aggiungi genere custom (es. Thall)"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white outline-none" 
                  />
                  <button 
                    onClick={() => handleAddCustomGenre(false)}
                    className="bg-easygig-accent p-2 rounded-xl text-white hover:bg-easygig-accent/80"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsCreateBandModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Annulla
                </button>
                <button 
                  onClick={handleCreateBand}
                  className="flex-1 bg-easygig-accent hover:bg-easygig-accent/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-easygig-accent/20 transition-all"
                >
                  Crea Band
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Band Modal */}
      {isEditBandModalOpen && editingBand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1a1d23] border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Modifica Band</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nome Band</label>
                <input 
                  type="text" 
                  value={editingBand.name} 
                  onChange={(e) => setEditingBand({...editingBand, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-easygig-accent outline-none" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Descrizione / Bio</label>
                <textarea 
                  value={editingBand.description || ''} 
                  onChange={(e) => setEditingBand({...editingBand, description: e.target.value})}
                  rows="3"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-easygig-accent outline-none resize-none" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Cachet Base (€)</label>
                  <input 
                    type="number" 
                    value={editingBand.cachet} 
                    onChange={(e) => setEditingBand({...editingBand, cachet: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tipo Band</label>
                  <select 
                    value={editingBand.bandType}
                    onChange={(e) => setEditingBand({...editingBand, bandType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none"
                  >
                    <option value="ORIGINAL">Originale</option>
                    <option value="COVER">Cover</option>
                    <option value="TRIBUTE">Tribute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Città</label>
                <input 
                  type="text" 
                  placeholder="Cerca città..."
                  value={citySearch}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none mb-2" 
                />
                {cities.length > 0 && (
                  <div className="bg-[#252a33] border border-white/10 rounded-xl max-h-40 overflow-y-auto">
                    {(Array.isArray(cities) ? cities : []).map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => { setEditingBand({...editingBand, cityId: c.id, cityName: c.name}); setCitySearch(c.name); setCities([]); }}
                        className="w-full text-left px-4 py-2 hover:bg-easygig-accent/20 text-sm"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Generi Musicali</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Array.isArray(availableGenres) ? availableGenres : []).map(genre => {
                    const isSelected = (Array.isArray(editingBand.genreIds) && editingBand.genreIds.includes(genre.id)) || 
                                     (Array.isArray(editingBand.genres) && editingBand.genres.some(g => g.id === genre.id));
                    return (
                      <button
                        key={genre.id}
                        onClick={() => {
                          const currentIds = Array.isArray(editingBand.genreIds) ? editingBand.genreIds : 
                                            (Array.isArray(editingBand.genres) ? editingBand.genres.map(g => g.id) : []);
                          let nextIds;
                          if (currentIds.includes(genre.id)) {
                            nextIds = currentIds.filter(id => id !== genre.id);
                          } else {
                            nextIds = [...currentIds, genre.id];
                          }
                          setEditingBand({
                            ...editingBand, 
                            genreIds: nextIds, 
                            genres: (Array.isArray(availableGenres) ? availableGenres : []).filter(g => nextIds.includes(g.id))
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          isSelected 
                            ? 'bg-easygig-accent text-white' 
                            : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/20'
                        }`}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Aggiungi genere custom (es. Thall)"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white outline-none" 
                  />
                  <button 
                    onClick={() => handleAddCustomGenre(true)}
                    className="bg-easygig-accent p-2 rounded-xl text-white hover:bg-easygig-accent/80"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setIsEditBandModalOpen(false); setEditingBand(null); }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Annulla
                </button>
                <button 
                  onClick={handleUpdateBand}
                  className="flex-1 bg-gradient-premium text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Salva Modifiche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {isGalleryModalOpen && editingBand && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#1a1d23] border border-white/10 w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh] relative">
            <button 
              onClick={() => setIsGalleryModalOpen(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
            
            <div className="mb-10">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-4">
                <Music className="text-easygig-accent" size={32} /> Galleria Foto: {editingBand.name}
              </h3>
              <p className="text-slate-500 font-medium">Gestisci le immagini ufficiali della tua band. La foto con la stella sarà la tua immagine del profilo.</p>
            </div>

            <div className="bg-white/[0.02] rounded-4xl border border-white/5 p-2">
              <PhotoGallery type="BAND" id={editingBand.id} onUpdate={refreshBands} />
            </div>
            
            <div className="mt-10 flex justify-center">
              <button 
                onClick={() => setIsGalleryModalOpen(false)}
                className="bg-easygig-accent hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
              >
                Chiudi Galleria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-easygig-accent text-white shadow-lg shadow-easygig-accent/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      <span className="hidden lg:block font-bold text-sm uppercase tracking-wider">{label}</span>
    </button>
  );
}

function StatCard({ label, value, color, text }) {
  return (
    <div className={`bg-gradient-to-br ${color} border border-white/5 p-6 rounded-3xl`}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${text}`}>{value}</p>
    </div>
  );
}


