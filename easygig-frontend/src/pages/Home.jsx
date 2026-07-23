import { useState, useEffect } from "react";
import { 
  Music, ArrowRight, ShieldCheck, Star, Users, MapPin, Calendar, 
  Search, CheckCircle2, MessageSquare, Sparkles, Building2, Radio,
  Clock, TrendingUp, SlidersHorizontal, ChevronRight, Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as profileApi from "../api/profile";

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // State per il widget di ricerca rapida nella Hero
  const [searchTab, setSearchTab] = useState("venues"); // 'venues' | 'bands' | 'promoters'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Esegue ricerca rapida al cambio dei filtri
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1 || searchCity.trim().length > 1) {
        setIsSearching(true);
        try {
          if (searchTab === "venues") {
            const data = await profileApi.searchVenues({ name: searchQuery, city: searchCity });
            setSearchResults(data.slice(0, 4));
          } else if (searchTab === "bands") {
            const data = await profileApi.searchBands({ name: searchQuery, city: searchCity });
            setSearchResults(data.slice(0, 4));
          } else {
            const data = await profileApi.searchOrganizations({ name: searchQuery, city: searchCity });
            setSearchResults(data.slice(0, 4));
          }
        } catch (e) {
          console.error("Errore ricerca home:", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchCity, searchTab]);

  return (
    <div className="min-h-screen bg-easygig-dark text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* --- NAVBAR --- */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                EasyGIG <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">v1.0</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Live Music Booking System</span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#search-section" className="hover:text-white transition-colors">Esplora Locali & Band</a>
            <a href="#ecosystem" className="hover:text-white transition-colors">Ecosistema</a>
            <a href="#guarantees" className="hover:text-white transition-colors">Garanzie & Strike</a>
          </nav>

          {/* Action Buttons / Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  if (user?.role === 'ARTIST') navigate('/dashboard/artist');
                  else if (user?.role === 'DIRECTOR') navigate('/dashboard/director');
                  else if (user?.role === 'PROMOTER') navigate('/dashboard/promoter');
                  else navigate('/profile');
                }}
                className="btn-primary"
              >
                <span>Dashboard ({user?.firstName || 'Utente'})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="btn-secondary"
                >
                  Accedi
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="btn-primary"
                >
                  Inizia Gratis
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Fine grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e2638_1px,transparent_1px),linear-gradient(to_bottom,#1e2638_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

        {/* Soft radial illumination */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-400 mb-8 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Piattaforma di Gestione Booking per la Musica Live</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Organizza i tuoi Gig live.<br />
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              In modo semplice, sicuro e trasparente.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-normal leading-relaxed">
            Un unico ecosistema professionale che connette <strong className="text-white font-semibold">Artisti</strong>, <strong className="text-white font-semibold">Direttori di Locali</strong> e <strong className="text-white font-semibold">Promoter</strong> con gestione slot in tempo reale, contratti e sistema di reputazione integrato.
          </p>

          {/* --- INTERACTIVE LIVE SEARCH WIDGET --- */}
          <div id="search-section" className="glass-panel p-4 sm:p-6 rounded-2xl max-w-3xl mx-auto shadow-studio border border-slate-800 text-left mb-16">
            
            {/* Tabs switcher */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
              <button 
                onClick={() => setSearchTab("venues")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${searchTab === 'venues' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Building2 className="w-3.5 h-3.5" /> Locali & Venue
              </button>
              <button 
                onClick={() => setSearchTab("bands")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${searchTab === 'bands' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Music className="w-3.5 h-3.5" /> Band & Artisti
              </button>
              <button 
                onClick={() => setSearchTab("promoters")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${searchTab === 'promoters' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Users className="w-3.5 h-3.5" /> Promoter & Crew
              </button>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchTab === 'venues' ? "Cerca locale per nome..." : searchTab === 'bands' ? "Cerca band o artista..." : "Cerca organizzazione..."}
                  className="input-studio pl-10 w-full"
                />
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Città (es. Roma, Milano, Bologna)"
                  className="input-studio pl-10 w-full"
                />
              </div>
            </div>

            {/* Live Results Preview Box */}
            {(searchResults.length > 0 || isSearching) && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {isSearching ? "Ricerca in corso..." : `Risultati per ${searchTab}:`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => navigate(`/${searchTab === 'venues' ? 'venue' : searchTab === 'bands' ? 'band' : 'promoter'}/${item.id}`)}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.cityName || item.city?.name || 'Italia'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stat metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatBox number="1.200+" label="Eventi Gestiti" />
            <StatBox number="48 Ore" label="Finestra Cancellazione" />
            <StatBox number="99.4%" label="Tasso di Presenza" />
            <StatBox number="4.9 / 5" label="Rating Medio Feedback" />
          </div>
        </div>
      </section>

      {/* --- ECOSYSTEM / ROLES SECTION --- */}
      <section id="ecosystem" className="py-24 px-6 border-t border-slate-800/80 bg-easygig-surface/50">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge-indigo mb-3">Ruoli & Funzionalità</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Progettato per ogni attore della musica dal vivo
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dalla gestione del calendario del locale fino alle candidature degli artisti e ai contratti dei promoter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card Artista */}
            <div className="glass-panel p-8 rounded-2xl glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                  <Music className="w-6 h-6" />
                </div>
                <span className="badge-indigo mb-2">Profilo Artista / Band</span>
                <h3 className="text-xl font-bold text-white mb-3">Trova Palchi & Candidati per Slot</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Crea il portfolio della tua band, carica brani audio e media gallery, ed invia richieste di ingaggio per gli slot di disponibilità pubblicati dai locali.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 font-medium mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Candidature dirette su slot aperti
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Portfolio con player audio integrato
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Chat diretta post-accettazione
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => navigate('/register')}
                className="w-full btn-secondary justify-between text-xs"
              >
                <span>Registrati come Artista</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card Direttore / Venue */}
            <div className="glass-panel p-8 rounded-2xl glass-panel-hover flex flex-col justify-between border-indigo-500/20 shadow-glow-subtle">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="badge-emerald mb-2">Profilo Direttore Locale</span>
                <h3 className="text-xl font-bold text-white mb-3">Programmazione e Gestione Slot</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Pubblica la disponibilità delle date sul tuo calendario live, valuta le proposte degli artisti e gestisci il palinsesto del tuo locale senza sovrapposizioni.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 font-medium mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Calendario slot e fasce orarie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sistema di inviti diretti agli artisti
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sistema di recensioni e reputazione
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => navigate('/register')}
                className="w-full btn-primary justify-between text-xs"
              >
                <span>Registrati come Direttore Locale</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card Promoter */}
            <div className="glass-panel p-8 rounded-2xl glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <span className="badge-amber mb-2">Profilo Promoter / Agenzia</span>
                <h3 className="text-xl font-bold text-white mb-3">Booking Multiplo & Roster Management</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Blocca date ed organizza serate complesse per conto delle tue band. Assegna gli artisti del tuo roster agli slot confermati ed assegna membri alle tue organizzazioni.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 font-medium mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Gestione roster e agenzie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Booking di gruppo multi-slot
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Inviti per il team organizzativo
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => navigate('/register')}
                className="w-full btn-secondary justify-between text-xs"
              >
                <span>Registrati come Promoter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* --- GUARANTEES & STRIKE SYSTEM --- */}
      <section id="guarantees" className="py-24 px-6 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="badge-amber mb-4">Affidabilità & Garanzie</span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                Protezione dalle cancellazioni dell'ultimo minuto
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                EasyGIG applica un sistema event-driven per tutelare sia gli artisti che i gestori dei locali da pacchi o cancellazioni arbitrarie.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Regola delle 48 Ore</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cancellare un evento confermato con meno di 48 ore di preavviso comporta l'assegnazione automatica di uno **Strike** al profilo.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Sistema di Reputazione Trasparente</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ogni recensione post-evento aggiorna il punteggio di reputazione, visibile pubblicamente nelle ricerche e nei filtri.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated System UI Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/90 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-200">Stato del Profilo & Reputazione</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">ID #84920</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Score Reputazione</p>
                  <p className="text-[10px] text-slate-400">Basato su 28 esibizioni verificate</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-amber-400 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Stato Penalità (Strike)</p>
                  <p className="text-[10px] text-slate-400">0 Strike ricevuti negli ultimi 12 mesi</p>
                </div>
                <span className="badge-emerald">Account Verificato</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              EG
            </div>
            <span>© 2026 EasyGIG Platform. Tutti i diritti riservati.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-slate-300 transition-colors">Termini di Servizio</a>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono text-[11px]">EasyGIG Microservices v1.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

function StatBox({ number, label }) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
      <p className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-0.5">{number}</p>
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}
