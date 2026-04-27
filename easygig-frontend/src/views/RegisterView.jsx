import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, User, Loader2, UserCircle } from 'lucide-react';

const RegisterView = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ARTIST',
    privacyAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await register(formData);
    if (success) navigate('/login');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Music size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Crea il tuo Account</h1>
          <p className="text-slate-500 mt-1 text-sm">Unisciti alla community di EasyGIG</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome</label>
              <input 
                type="text" required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cognome</label>
              <input 
                type="text" required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Mail size={16} />
              </span>
              <input 
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock size={16} />
              </span>
              <input 
                type="password" required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ruolo</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="ARTIST">Artista / Band</option>
              <option value="DIRECTOR">Gestore Locale</option>
              <option value="PROMOTER">Promoter</option>
            </select>
          </div>

          <div className="flex items-start gap-3 px-1 py-2">
            <input 
              type="checkbox" 
              id="privacy"
              required
              checked={formData.privacyAccepted}
              onChange={(e) => setFormData({...formData, privacyAccepted: e.target.checked})}
              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer"
            />
            <label htmlFor="privacy" className="text-[11px] text-slate-400 leading-tight cursor-pointer select-none">
              Accetto i <a href="#" className="text-indigo-400 hover:underline">Termini di Servizio</a> e l' <a href="#" className="text-indigo-400 hover:underline">Informativa sulla Privacy</a> di EasyGIG Pro.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !formData.privacyAccepted}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 py-3.5 rounded-2xl text-white font-bold text-base transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Registrati"}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500 text-xs font-medium">
          Hai già un account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Accedi</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterView;
