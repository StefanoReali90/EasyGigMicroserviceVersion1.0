import React from 'react';
import { Search, Bell, User, ChevronDown, Menu } from 'lucide-react';

const Topbar = () => {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 z-40 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="relative w-96">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search for artists, events or analytics..." 
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-800 mx-2"></div>

        <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-800 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <User size={18} />
          </div>
          <span className="text-sm font-medium text-slate-300">Admin Panel</span>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
