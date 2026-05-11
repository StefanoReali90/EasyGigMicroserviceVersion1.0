import { Link } from 'react-router-dom';
import { Music, ShieldCheck, Scale } from 'lucide-react';

export default function LegalFooter() {
  return (
    <footer className="w-full bg-easygig-dark border-t border-white/5 py-16 px-6 lg:px-12 mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-easygig-accent/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        
        <div className="space-y-4 text-center md:text-left">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="bg-easygig-accent p-2 rounded-xl group-hover:rotate-12 transition-all">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">EasyGIG</span>
          </Link>
          <p className="text-slate-500 text-sm max-w-xs font-medium">
            La piattaforma definitiva per artisti e locali. Sicura, professionale, trasparente.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> Legale
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-slate-400 hover:text-easygig-accent transition-colors text-sm font-bold">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-slate-400 hover:text-easygig-accent transition-colors text-sm font-bold">Termini di Servizio</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Scale size={12} /> Compliance
            </h4>
            <ul className="space-y-2">
              <li className="text-slate-400 text-sm font-bold">GDPR Ready</li>
              <li className="text-slate-400 text-sm font-bold">Cookie Policy</li>
            </ul>
          </div>
        </div>

        <div className="text-center md:text-right space-y-2">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">© 2026 EasyGig Microservices</p>
          <p className="text-slate-600 text-[9px] uppercase tracking-tighter">Designed for Professional Musicians & Venues</p>
        </div>

      </div>
    </footer>
  );
}
