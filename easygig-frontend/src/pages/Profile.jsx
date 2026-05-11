import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  ChevronLeft,
  Camera,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as profileApi from '../api/profile';
import { getErrorMessage } from '../utility/errorHandler';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: ''
  });

  const [accountStatus, setAccountStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const fullUser = await profileApi.getUser(user.id);
        setAccountStatus(fullUser.stateAccount);
      } catch (err) {
        console.error("Errore recupero stato account:", err);
      }
    };
    if (user) fetchStatus();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedUser = await profileApi.updateUser(user.id, formData);
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, "aggiornamento profilo") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-easygig-dark text-slate-200 font-sans selection:bg-easygig-accent/30 overflow-x-hidden p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Torna indietro
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
             <Shield size={16} className="text-easygig-accent" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Sicuro</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar / Avatar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-easygig-card border border-white/5 rounded-[3rem] p-10 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-easygig-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-32 h-32 bg-gradient-to-tr from-easygig-accent to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/20 border-4 border-white/10 relative group/avatar">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera size={24} />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{user?.firstName} {user?.lastName}</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{user?.role}</p>
                
                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Membro dal</span>
                      <span className="text-white font-bold">Maggio 2026</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Stato Account</span>
                      <span className="text-emerald-500 font-black uppercase tracking-tighter">Attivo</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Account Health */}
            {accountStatus && (
              <div className={`p-8 rounded-[2.5rem] border ${accountStatus.strikes > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <h4 className="font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                  {accountStatus.strikes > 0 ? <AlertTriangle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                  Salute Account
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-400">Strikes Accumulati</span>
                    <span className={`text-2xl font-black ${accountStatus.strikes > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{accountStatus.strikes}/3</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${accountStatus.strikes > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${(accountStatus.strikes / 3) * 100}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Al terzo strike l'account viene sospeso automaticamente.</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-easygig-card border border-white/5 rounded-[3rem] p-10 lg:p-12 space-y-10 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Informazioni Personali</h3>
                <User className="text-easygig-accent" size={32} />
              </div>

              {message.text && (
                <div className={`p-5 rounded-2xl flex items-center gap-4 animate-slide-up ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  <p className="text-sm font-bold">{message.text}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-easygig-accent outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cognome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-easygig-accent outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email di Contatto</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-easygig-accent outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nuova Password (lascia vuoto per non cambiare)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-easygig-accent outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-premium text-white font-black px-12 py-5 rounded-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Salva Modifiche"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
