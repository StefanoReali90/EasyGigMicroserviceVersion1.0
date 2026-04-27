import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatsCard from "./components/StatsCard";
import UserTable from "./components/UserTable";
import Calendar from "./components/Calendar";
import ArtistsView from "./views/ArtistsView";
import { useAuth } from './context/AuthContext';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import { Users, Music, CalendarCheck, Zap, LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import { api } from './api';

function DashboardOverview({ users }) {
  return (
    <>
      {/* Welcome Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">System Overview</h1>
          <p className="text-slate-500 mt-1">Real-time metrics from your microservices ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          label="Total Artists" 
          value={Array.isArray(users) ? users.filter(u => u.role === 'ARTIST').length : "0"} 
          trend="up" trendValue="12%" icon={<Music size={20} />} color="indigo"
        />
        <StatsCard 
          label="Registered Users" 
          value={Array.isArray(users) ? users.length : "0"} 
          trend="up" trendValue="24%" icon={<Users size={20} />} color="emerald"
        />
        <StatsCard 
          label="Live Events" 
          value="86" trend="down" trendValue="3%" icon={<CalendarCheck size={20} />} color="amber"
        />
        <StatsCard 
          label="API Requests" 
          value="1.2k" trend="up" trendValue="42%" icon={<Zap size={20} />} color="blue"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <UserTable users={users} />
        </div>
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
            <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/20 group-hover:scale-110 transition-transform duration-500" />
            <h4 className="text-lg font-bold mb-2">Upgrade to Pro</h4>
            <p className="text-indigo-100 text-sm mb-4">Unlock advanced analytics and multi-venue management features.</p>
            <button className="w-full bg-white text-indigo-600 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CalendarView() {
  const [slots, setSlots] = useState([]);
  
  useEffect(() => {
    // Defaulting to venue 1 for demonstration
    api.slots.getCalendar(1, new Date().getMonth() + 1, new Date().getFullYear())
      .then(data => setSlots(data.slots || []))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Event Calendar</h1>
        <p className="text-slate-500 mt-1">Manage availability and booking requests for your venue.</p>
      </header>
      <Calendar slots={slots} />
    </div>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (user) {
      api.users.list().then(setUsers).catch(err => console.error("Fetch failed", err));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="*" element={<LoginView />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 flex">
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
          <div className="p-6 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Music size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Easy<span className="text-indigo-500">GIG</span></span>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
            <NavLink to="/artists" icon={<Users size={20} />} label="Artists & Bands" />
            <NavLink to="/calendar" icon={<CalendarCheck size={20} />} label="Calendar" />
            <NavLink to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
            <NavLink to="/settings" icon={<Settings size={20} />} label="Settings" />
          </nav>

          <div className="p-4 border-t border-slate-800">
             <button 
               onClick={logout}
               className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
             >
               <Zap size={18} />
               <span>Esci</span>
             </button>
          </div>
        </aside>

        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-8 pt-24">
            <Routes>
              <Route path="/" element={<DashboardOverview users={users} />} />
              <Route path="/artists" element={<ArtistsView />} />
              <Route path="/calendar" element={<CalendarView />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

const NavLink = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  
  return (
    <Link to={to} className={`
      flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
      ${active 
        ? 'bg-indigo-600/10 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }
    `}>
      <span className={active ? 'text-indigo-500' : 'text-slate-500'}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default App;
