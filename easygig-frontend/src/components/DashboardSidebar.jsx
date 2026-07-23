import { Music, LogOut, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Sidebar di navigazione condivisa tra le dashboard Artist, Director e Promoter.
 *
 * @param {Array<{icon, label, section, onClick}>} navItems - Voci di navigazione
 * @param {string}  currentSection    - Sezione attiva corrente
 * @param {string}  [brandLabel]      - Label brand nella sidebar (default: EASYGIG)
 */
export default function DashboardSidebar({ navItems = [], currentSection, brandLabel = 'EASYGIG' }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return (
    <aside className="w-20 lg:w-64 border-r border-white/5 bg-easygig-card/50 backdrop-blur-xl flex flex-col items-center lg:items-start py-8 px-4 fixed h-full z-40 transition-all">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
          <Music className="text-white" size={20} />
        </div>
        <span className="hidden lg:block font-black text-xl tracking-tighter text-white">{brandLabel}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.section || item.label}
            icon={item.icon}
            label={item.label}
            active={currentSection === item.section}
            onClick={item.onClick}
          />
        ))}

        {/* Messaggi - sempre presente */}
        <SidebarNavItem
          icon={<MessageSquare size={20} />}
          label="Messaggi"
          active={false}
          onClick={() => navigate('/messages')}
        />
      </nav>

      {/* Logout */}
      <button
        id="sidebar-logout"
        onClick={() => { logout(); navigate('/'); }}
        className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-white transition-colors mt-auto"
      >
        <LogOut size={20} />
        <span className="hidden lg:block font-bold text-sm uppercase tracking-wider">Logout</span>
      </button>
    </aside>
  );
}

function SidebarNavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-easygig-accent text-white shadow-lg shadow-easygig-accent/20'
          : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden lg:block font-bold text-sm uppercase tracking-wider">{label}</span>
    </button>
  );
}
