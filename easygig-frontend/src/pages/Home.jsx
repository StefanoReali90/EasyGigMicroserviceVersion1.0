import { Music, ArrowRight, Zap, Shield, Star, Users, MapPin, Calendar, Search, Play, CheckCircle2, MessageSquare, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-easygig-dark text-white font-sans selection:bg-easygig-accent/30 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-easygig-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-gradient-premium p-2 rounded-xl group-hover:rotate-12 transition-all shadow-lg shadow-indigo-500/20">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">EasyGIG</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Funzionalità</a>
            <a href="#roles" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Chi Siamo</a>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <button 
              onClick={() => navigate('/login')} 
              className="text-[10px] font-black uppercase tracking-widest hover:text-easygig-accent transition-colors"
            >
              Accedi
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-slate-950 hover:bg-easygig-accent hover:text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              Inizia Ora
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-10 backdrop-blur-md animate-fade-in">
            <Zap className="w-4 h-4 fill-current" />
            <span>Nuova Versione 1.0 Live</span>
          </div>

          <h1 className="text-7xl md:text-[120px] font-black tracking-tighter mb-10 leading-[0.85] uppercase">
            IL PALCO È TUO.<br />
            <span className="text-gradient">
              PENSIAMO A TUTTO.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-14 leading-relaxed font-medium">
            La piattaforma gestionale definitiva per la musica dal vivo. 
            Connettiamo <span className="text-white">Artisti</span>, <span className="text-white">Locali</span> e <span className="text-white">Promoter</span> in un unico ecosistema professionale.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center mb-24">
            <button 
              onClick={() => navigate('/register')}
              className="group bg-gradient-premium p-[2px] rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
            >
              <div className="bg-slate-950 text-white px-12 py-6 rounded-full font-black text-xl flex items-center gap-3 group-hover:bg-transparent transition-colors">
                Unisciti alla Community
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
            <button 
               onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
               className="px-10 py-6 rounded-full font-black text-xl text-slate-400 hover:text-white transition-colors"
            >
              Scopri di più
            </button>
          </div>

          {/* Feature Grid Quick Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl px-4 py-12 border-y border-white/5 bg-white/[0.01] backdrop-blur-sm rounded-[3rem]">
             <div className="text-center">
                <p className="text-4xl font-black text-white mb-1 tracking-tighter">500+</p>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Artisti</p>
             </div>
             <div className="text-center">
                <p className="text-4xl font-black text-white mb-1 tracking-tighter">120+</p>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Locali</p>
             </div>
             <div className="text-center">
                <p className="text-4xl font-black text-white mb-1 tracking-tighter">1.2k</p>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Gig Prenotati</p>
             </div>
             <div className="text-center">
                <p className="text-4xl font-black text-white mb-1 tracking-tighter">4.9</p>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Rating Medio</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- ROLES SECTION --- */}
      <section id="roles" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
             <div className="max-w-2xl">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-easygig-accent mb-4">Un Ecosistema per Tutti</h2>
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase">Progettato per chi vive di musica.</h3>
             </div>
             <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
               Che tu sia un solista, il gestore di un jazz club o un promoter professionista, abbiamo gli strumenti giusti per te.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <RoleCard 
                role="ARTISTA"
                title="Gestisci i tuoi Tour"
                description="Crea il tuo portfolio, carica le tue tracce migliori e candidati per slot disponibili in tutta Italia."
                icon={<Music size={32} />}
                features={['Portfolio Media', 'Player Integrato', 'Chat Diretta']}
                color="indigo"
             />
             <RoleCard 
                role="DIRETTORE"
                title="Programma il Locale"
                description="Automatizza le richieste, gestisci il calendario eventi e recensisci gli artisti che si esibiscono da te."
                icon={<MapPin size={32} />}
                features={['Calendario Slot', 'Review System', 'Booking Management']}
                color="purple"
             />
             <RoleCard 
                role="PROMOTER"
                title="Scala l'Organizzazione"
                description="Gestisci roster multipli di band e organizza eventi complessi su più date e locali contemporaneamente."
                icon={<Award size={32} />}
                features={['Roster Management', 'Multi-booking', 'Analytics']}
                color="pink"
             />
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 px-6 bg-easygig-card/50 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-none">Più musica, meno carta.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">Abbiamo digitalizzato ogni passaggio del booking per lasciarti il tempo di concentrarti solo sulla performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Shield className="w-10 h-10 text-indigo-400" />}
              title="Affidabilità Garantita"
              description="Il sistema di Strike e le recensioni verificate scoraggiano comportamenti poco professionali e cancellazioni dell'ultimo minuto."
            />
            <FeatureCard 
              icon={<Calendar className="w-10 h-10 text-purple-400" />}
              title="Real-time Availability"
              description="Niente più email avanti e indietro. Visualizza gli slot liberi, seleziona l'orario e invia la candidatura istantaneamente."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-10 h-10 text-pink-400" />}
              title="Chat Organizzativa"
              description="Una volta accettato il booking, comunica direttamente con il locale per definire i dettagli tecnici tramite la chat sicura."
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-premium rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
           <Zap className="absolute -left-12 -top-12 w-64 h-64 text-white/10 -rotate-12" />
           <Music className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 rotate-12" />
           
           <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-none">Pronto per il<br />prossimo Gig?</h2>
              <p className="text-white/80 text-xl max-w-xl mb-12 font-medium">Unisciti a migliaia di professionisti che stanno già rivoluzionando la musica live in Italia.</p>
              <button 
                onClick={() => navigate('/register')}
                className="bg-white text-slate-950 hover:bg-slate-100 px-16 py-7 rounded-full font-black text-2xl uppercase tracking-widest shadow-2xl transition-all active:scale-95"
              >
                Inizia Ora Gratis
              </button>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 border-t border-white/5 bg-easygig-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="bg-gradient-premium p-2 rounded-xl text-white shadow-lg">
                  <Music className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">EasyGIG</span>
              </div>
              <p className="text-slate-500 max-w-xs font-medium leading-relaxed">
                Costruiamo il futuro della musica live, un Gig alla volta. La tecnologia al servizio dell'arte.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Piattaforma</h4>
                  <ul className="space-y-4 text-slate-500 text-sm font-medium">
                     <li><a href="#" className="hover:text-white transition-colors">Esplora Locali</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Band & Artisti</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Organizzatori</a></li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Supporto</h4>
                  <ul className="space-y-4 text-slate-500 text-sm font-medium">
                     <li><a href="#" className="hover:text-white transition-colors">Centro Assistenza</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Linee Guida</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Contattaci</a></li>
                  </ul>
               </div>
               <div className="space-y-6 hidden sm:block">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Legal</h4>
                  <ul className="space-y-4 text-slate-500 text-sm font-medium">
                     <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  </ul>
               </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">© 2026 EasyGIG Platform. All Rights Reserved.</p>
             <div className="flex gap-8">
                {/* Social placeholders */}
                <div className="w-5 h-5 bg-slate-800 rounded-full hover:bg-easygig-accent transition-colors cursor-pointer" />
                <div className="w-5 h-5 bg-slate-800 rounded-full hover:bg-easygig-accent transition-colors cursor-pointer" />
                <div className="w-5 h-5 bg-slate-800 rounded-full hover:bg-easygig-accent transition-colors cursor-pointer" />
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ role, title, description, icon, features, color }) {
  const colors = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20",
    pink: "from-pink-500/20 to-pink-500/5 text-pink-400 border-pink-500/20"
  };

  return (
    <div className={`p-10 rounded-5xl bg-gradient-to-br ${colors[color]} border backdrop-blur-sm group hover:scale-[1.02] transition-all duration-500`}>
       <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 block">{role}</span>
       <h4 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{title}</h4>
       <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">{description}</p>
       
       <div className="space-y-3">
          {features.map((f, i) => (
             <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={14} className="opacity-40" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{f}</span>
             </div>
          ))}
       </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-10 rounded-[3rem] bg-easygig-card border border-white/5 hover:border-easygig-accent/30 transition-all duration-500 group shadow-xl">
      <div className="mb-8 p-4 bg-white/[0.03] rounded-2xl w-fit group-hover:scale-110 group-hover:bg-easygig-accent/10 transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium text-sm">{description}</p>
    </div>
  );
}

