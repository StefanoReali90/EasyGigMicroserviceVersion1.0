import { Music, ArrowRight, Zap, Shield, Star, Users, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-easygig-dark text-white font-sans selection:bg-easygig-accent/30 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-easygig-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-easygig-accent p-2 rounded-xl group-hover:rotate-12 transition-all shadow-lg shadow-indigo-500/20">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">EasyGIG</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Funzionalità</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Come Funziona</a>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-bold hover:text-easygig-accent transition-colors"
            >
              Accedi
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-easygig-accent hover:bg-indigo-500 px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Inizia Ora
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm text-indigo-300 mb-8 backdrop-blur-sm animate-fade-in">
            <Zap className="w-4 h-4 fill-current" />
            <span>Versione 1.0 ora disponibile</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            IL PALCO È TUO.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              NOI PENSIAMO AL RESTO.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
            La piattaforma gestionale definitiva per la musica dal vivo. 
            Connettiamo artisti e locali attraverso una tecnologia sicura, trasparente e professionale.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button className="group bg-white text-slate-950 px-10 py-5 rounded-full font-black text-xl flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95 shadow-2xl">
              Registrati Gratuitamente
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-20 flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-easygig-dark bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=artist${i}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Oltre <span className="text-white font-bold">500+ Artisti</span> hanno già prenotato il loro prossimo Gig su EasyGIG
            </p>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Tutto quello che ti serve per suonare.</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Abbiamo automatizzato la burocrazia per lasciarti concentrare solo sulla tua musica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-indigo-400" />}
              title="Sistema di Reputazione"
              description="Algoritmi avanzati che garantiscono la serietà di artisti e locali. Zero sorprese, solo professionalità."
            />
            <FeatureCard 
              icon={<Calendar className="w-8 h-8 text-purple-400" />}
              title="Gestione Slot Intelligente"
              description="Visualizza le date libere dei locali in tempo reale e prenota con un click. Tutto centralizzato."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-pink-400" />}
              title="Community Verificata"
              description="Profili completi con media, recensioni e storico eventi per decidere sempre con chi collaborare."
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <Music className="text-easygig-accent" />
            <span className="text-xl font-bold tracking-tighter">EasyGIG</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 EasyGIG Platform. Designed for the Live Music Ecosystem.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Termini</a>
            <a href="#" className="hover:text-white transition-colors">Contatti</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group">
      <div className="mb-6 p-3 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
