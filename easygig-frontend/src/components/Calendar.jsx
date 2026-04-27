import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const Calendar = ({ slots = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust to Monday start

  // Empty cells for alignment
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 border border-slate-800/50 bg-slate-900/20"></div>);
  }

  // Day cells
  for (let d = 1; d <= totalDays; d++) {
    const daySlots = slots.filter(s => {
      const sDate = new Date(s.start);
      return sDate.getDate() === d && sDate.getMonth() === month && sDate.getFullYear() === year;
    });

    days.push(
      <div key={d} className="h-32 border border-slate-800/50 p-2 hover:bg-slate-800/30 transition-colors group relative">
        <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors">{d}</span>
        <div className="mt-1 space-y-1 overflow-y-auto max-h-24 no-scrollbar">
          {daySlots.map(slot => (
            <div 
              key={slot.id} 
              className={`text-[10px] p-1 rounded border flex items-center gap-1 ${getStatusStyles(slot.state)}`}
            >
              <Clock size={8} />
              <span className="truncate">{new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Calendar Header */}
      <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white tracking-tight">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 bg-slate-800/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center py-2 border-b border-slate-800">
        <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days}
      </div>
    </div>
  );
};

const getStatusStyles = (state) => {
  switch (state) {
    case 'AVAILABLE':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]';
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]';
    case 'BOOKED':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.1)]';
    default:
      return 'bg-slate-700 text-slate-300 border-slate-600';
  }
};

export default Calendar;
