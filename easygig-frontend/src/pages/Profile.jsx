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
  MapPin,
  Star,
  Activity,
  Calendar,
  Settings,
  Bell
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
        setAccountStatus(fullUser);
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
    <div className="min-h-screen bg-easygig-dark text-slate-200 font-sans selection:bg-easygig-accent/30 overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-easygig-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 space-y-12 animate-fade-in">
        
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">Torna Indietro</span>
          </button>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Shield size={16} className="text-easygig-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Protetto</span>
             </div>
             <button className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                <Bell size={20} />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: User Identity Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-easygig-card border border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-premium opacity-20" />
              
              <div className="relative z-10 text-center">
                <div className="w-40 h-40 mx-auto mb-8 relative group/avatar">
                  <div className="w-full h-full bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-easygig-dark group-hover:scale-105 transition-transform duration-500">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-4 bg-easygig-accent text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                    <Camera size={20} />
                  </button>
                </div>

                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                   {user?.firstName} {user?.lastName}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-easygig-accent/10 border border-easygig-accent/20 rounded-full mb-8">
                   <div className="w-1.5 h-1.5 bg-easygig-accent rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-easygig-accent uppercase tracking-[0.2em]">{user?.role}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reputazione</p>
                      <div className="flex items-center gap-2">
                        <Star size={18} className="text-amber-400 fill-amber-400" />
                        <span className="text-xl font-black text-white">{accountStatus?.reputation || "5.0"}</span>
                      </div>
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Strike</p>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className={accountStatus?.strikes > 0 ? "text-rose-500" : "text-emerald-500"} />
                        <span className="text-xl font-black text-white">{accountStatus?.strikes || 0}/5</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Account Quick Stats */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10 space-y-8">
               <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                 <Activity size={16} /> Panoramica Attività
               </h4>
               
               <div className="space-y-6">
                  <StatItem icon={<Calendar className="text-indigo-400" />} label="Data Iscrizione" value="Mag 2026" />
                  <StatItem icon={<MapPin className="text-purple-400" />} label="Base Operativa" value={user?.cityName || "Italia"} />
                  <StatItem icon={<CheckCircle2 className="text-emerald-400" />} label="Verifica" value="Completa" />
               </div>
            </div>
          </div>

          {/* Right Column: Settings Form */}
          <div className="lg:col-span-8">
            <div className="bg-easygig-card border border-white/5 rounded-[3.5rem] p-8 lg:p-14 shadow-2xl space-y-12">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-10">
                <div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Impostazioni</h3>
                  <p className="text-slate-500 font-medium">Gestisci i tuoi dati personali e la sicurezza dell'account.</p>
                </div>
                <div className="p-5 bg-white/5 rounded-[2rem] text-easygig-accent">
                   <Settings size={32} />
                </div>
              </div>

              {message.text && (
                <div className={`p-6 rounded-3xl flex items-center gap-4 animate-slide-up border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  <p className="font-bold">{message.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <InputGroup 
                    label="Nome" 
                    value={formData.firstName} 
                    onChange={(v) => setFormData({...formData, firstName: v})}
                    icon={<User size={20} />}
                  />
                  <InputGroup 
                    label="Cognome" 
                    value={formData.lastName} 
                    onChange={(v) => setFormData({...formData, lastName: v})}
                    icon={<User size={20} />}
                  />
                </div>

                <InputGroup 
                  label="Indirizzo Email" 
                  value={formData.email} 
                  onChange={(v) => setFormData({...formData, email: v})}
                  icon={<Mail size={20} />}
                  type="email"
                />

                <div className="pt-10 border-t border-white/5">
                   <InputGroup 
                    label="Aggiorna Password" 
                    placeholder="••••••••••••"
                    value={formData.password} 
                    onChange={(v) => setFormData({...formData, password: v})}
                    icon={<Lock size={20} />}
                    type="password"
                    sublabel="Lascia vuoto se non desideri cambiarla."
                  />
                </div>

                <div className="flex justify-end pt-6">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gradient-premium text-white font-black px-16 py-6 rounded-[2rem] uppercase tracking-[0.2em] text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-4"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Aggiorna Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-white uppercase">{value}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, icon, type = "text", placeholder = "", sublabel = "" }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</label>
        {sublabel && <span className="text-[9px] text-slate-600 italic">{sublabel}</span>}
      </div>
      <div className="relative group/input">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-easygig-accent transition-colors">
          {icon}
        </div>
        <input 
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-white text-lg font-medium focus:ring-2 focus:ring-easygig-accent/50 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-700 shadow-inner"
        />
      </div>
    </div>
  );
}
