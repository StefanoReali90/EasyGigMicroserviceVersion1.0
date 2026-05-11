import { useAuthStore } from '../store/authStore';
import { AlertTriangle, LogOut, Mail } from 'lucide-react';

export default function BanGuard({ children }) {
  const { user, logout } = useAuthStore();

  if (user?.isBanned) {
    return (
      <div className="min-h-screen bg-easygig-dark flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        <div className="max-w-2xl w-full bg-slate-900 border border-rose-500/30 rounded-[3rem] p-12 text-center shadow-2xl shadow-rose-500/10 animate-fade-in">
          <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
            <AlertTriangle size={48} className="text-rose-500" />
          </div>
          
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Profilo Sospeso</h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Il tuo account è stato temporaneamente sospeso a causa del raggiungimento del limite massimo di **5 Strike**.
            EasyGIG richiede il massimo della professionalità per garantire la qualità degli eventi.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Data Fine Sospensione</p>
              <p className="text-xl font-bold text-rose-400">Controlla la tua Email</p>
            </div>
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white font-black">
              !
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <a 
              href="mailto:support@easygig.com"
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-5 rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-3"
            >
              <Mail size={20} /> Contatta Supporto
            </a>
            <button 
              onClick={logout}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={20} /> Esci
            </button>
          </div>
          
          <p className="mt-8 text-[10px] text-slate-600 uppercase font-black tracking-widest">
            Codice Errore: ACC_SUSPENDED_STRIKE_LIMIT
          </p>
        </div>
      </div>
    );
  }

  return children;
}
