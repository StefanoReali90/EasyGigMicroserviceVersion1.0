import { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as notificationApi from '../api/notifications';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function NotificationCenter({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const [data, count] = await Promise.all([
        notificationApi.getNotifications(userId),
        notificationApi.getUnreadCount(userId)
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (error) {
      console.error("Errore caricamento notifiche:", error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Errore lettura notifica:", error);
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationApi.markAllAsRead(userId);
      fetchNotifications();
    } catch (error) {
      console.error("Errore lettura tutte notifiche:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING': return <Clock className="text-easygig-accent" size={16} />;
      case 'STRIKE': return <AlertTriangle className="text-rose-500" size={16} />;
      case 'SYSTEM': return <Info className="text-blue-500" size={16} />;
      default: return <Bell className="text-slate-500" size={16} />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
      >
        <Bell className={`group-hover:rotate-12 transition-transform ${unreadCount > 0 ? 'text-easygig-accent' : 'text-slate-400'}`} size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900 shadow-lg animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-96 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden animate-slide-down">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight">Notifiche</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{unreadCount} non lette</p>
              </div>
              <button 
                onClick={handleReadAll}
                className="text-[10px] font-black uppercase text-easygig-accent hover:underline"
              >
                Segna tutte come lette
              </button>
            </div>

            {/* List */}
            <div className="max-h-[32rem] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic">
                   <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Bell className="opacity-20" size={32} />
                   </div>
                   Nessuna notifica al momento.
                </div>
              ) : (
                (notifications || []).map((n) => (
                  <div 
                    key={n.id}
                    className={`p-6 border-b border-white/5 flex gap-4 transition-colors ${!n.readStatus ? 'bg-easygig-accent/5' : 'hover:bg-white/5'}`}
                  >
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className={`font-bold text-sm ${!n.readStatus ? 'text-white' : 'text-slate-400'}`}>{n.title}</h5>
                        {!n.readStatus && (
                          <button 
                            onClick={() => handleMarkRead(n.id)}
                            className="p-1 hover:bg-easygig-accent/20 rounded-lg text-easygig-accent"
                            title="Segna come letta"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase mt-2 tracking-widest">
                        {format(new Date(n.timestamp), 'dd MMM HH:mm', { locale: it })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950/40 text-center border-t border-white/5">
              <button className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                Vedi tutte le attività
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
