import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Shield } from 'lucide-react';

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Calcola le iniziali
  const initials = user ? `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`.toUpperCase() : '??';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-easygig-accent to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-easygig-accent/20 hover:scale-105 transition-all border-2 border-white/10"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-[#1a1d23] border border-white/10 rounded-3xl shadow-2xl py-4 z-50 animate-fade-in backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-white/5 mb-2">
            <p className="font-black text-white uppercase tracking-tight">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
            <div className="mt-2 inline-block px-2 py-1 bg-easygig-accent/10 rounded-lg">
              <p className="text-[9px] text-easygig-accent font-black uppercase tracking-tighter">{user.role}</p>
            </div>
          </div>

          <MenuButton icon={<User size={18} />} label="Il mio Profilo" onClick={() => { setIsOpen(false); navigate('/profile'); }} />
          <MenuButton icon={<Settings size={18} />} label="Impostazioni" onClick={() => { setIsOpen(false); }} />
          
          <div className="my-2 border-t border-white/5" />
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-rose-500 hover:bg-rose-500/10 transition-colors font-bold text-sm uppercase tracking-wider"
          >
            <LogOut size={18} />
            Esci
          </button>
        </div>
      )}
    </div>
  );
}

function MenuButton({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-wider text-left"
    >
      {icon}
      {label}
    </button>
  );
}
