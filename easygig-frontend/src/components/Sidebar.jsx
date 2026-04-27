import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  Calendar, 
  Settings, 
  LogOut, 
  BarChart3,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      {/* Brand Logo */}
      <div className="p-6 mb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Music size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Easy<span className="text-indigo-500">GIG</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
          Management
        </div>
        <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
        <NavItem icon={<Users size={20} />} label="Artists & Bands" />
        <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
        <NavItem icon={<Calendar size={20} />} label="Events" />
        
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mt-8 mb-2">
          Admin
        </div>
        <NavItem icon={<ShieldCheck size={20} />} label="Security" />
        <NavItem icon={<Settings size={20} />} label="Settings" />
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            SR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Stefano Reali</p>
            <p className="text-[10px] text-slate-500 truncate">Administrator</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active }) => (
  <div className={`
    flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
    ${active 
      ? 'bg-indigo-600/10 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]' 
      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }
  `}>
    <span className={active ? 'text-indigo-500' : 'text-slate-500'}>
      {icon}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default Sidebar;
