import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import * as bookingApi from '../api/bookings';
import * as chatApi from '../api/chat';
import { 
  MessageSquare, 
  Send, 
  Music, 
  Landmark, 
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utility/errorHandler';
import UserMenu from '../components/UserMenu';




export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const stompClient = useRef(null);
  const scrollRef = useRef();

  // 1. Fetch Conversations (Accepted Bookings)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const bookings = await bookingApi.getUserBookings(user.id);
        const accepted = bookings.filter(b => b.status === 'ACCEPTED');
        setConversations(accepted);
      } catch (error) {
        console.error("Errore recupero conversazioni:", error);
        // Trattiamo l'errore come assenza di chat per una UX più pulita
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchConversations();
  }, [user]);

  // 2. Setup WebSocket Connection when a chat is selected
  useEffect(() => {
    if (activeChat) {
      // Fetch historical messages
      const fetchHistory = async () => {
        try {
          const data = await chatApi.getMessages(activeChat.bookingId);
          setMessages(data);
        } catch (error) {
          console.error("Errore storico messaggi:", error);
          alert(getErrorMessage(error, "recupero dello storico messaggi"));
        }

      };
      fetchHistory();

      // Initialize STOMP Client
      const socket = new SockJS('http://localhost:8080/ws');
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log(str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('Connected: ' + frame);
        client.subscribe(`/topic/messages/${activeChat.bookingId}`, (message) => {
          const receivedMsg = JSON.parse(message.body);
          setMessages(prev => [...prev, receivedMsg]);
        });
      };

      client.onStompError = (frame) => {
        console.error('STOMP error', frame.headers['message']);
      };

      client.activate();
      stompClient.current = client;

      return () => {
        if (stompClient.current) {
          stompClient.current.deactivate();
        }
      };
    }
  }, [activeChat]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat || !stompClient.current?.connected) return;

    const msg = {
      senderId: user.id,
      recipientId: user.role === 'ARTIST' ? 'DIRECTOR' : 'ARTIST', // Simplified for now
      content: newMessage,
      bookingId: activeChat.bookingId
    };

    stompClient.current.publish({
      destination: `/app/chat/${activeChat.bookingId}`,
      body: JSON.stringify(msg)
    });

    setNewMessage("");
  };

  if (isLoading) return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center">
      <Loader2 className="animate-spin text-easygig-accent" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-easygig-dark text-white flex font-sans overflow-hidden">
      
      {/* Sidebar: Conversations List */}
      <div className={`w-full md:w-96 border-r border-white/5 flex flex-col bg-slate-900/50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 border-b border-white/5 bg-slate-950/20 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <MessageSquare className="text-easygig-accent" /> Chat
          </h2>
          <button 
            onClick={() => navigate(user.role === 'ARTIST' ? '/dashboard/artist' : user.role === 'DIRECTOR' ? '/dashboard/director' : '/dashboard/promoter')}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
            title="Torna alla Dashboard"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 italic">Nessuna chat attiva.</div>
          ) : (
            conversations.map(chat => (
              <button 
                key={chat.bookingId}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-6 flex items-center gap-4 transition-all border-b border-white/5 ${activeChat?.bookingId === chat.bookingId ? 'bg-easygig-accent/10 border-r-4 border-r-easygig-accent' : 'hover:bg-white/5'}`}
              >
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                  {user.role === 'ARTIST' ? <Landmark size={20} /> : <Music size={20} />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold truncate">Prenotazione #{chat.bookingId.substring(0, 8)}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold truncate">
                    {format(new Date(chat.slotStart || chat.createdAt), 'dd MMMM yyyy')}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-white/5 rounded-full"><ChevronLeft /></button>
                <div>
                  <h3 className="font-black uppercase tracking-tight">Booking #{activeChat.bookingId.substring(0, 8)}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stompClient.current?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {stompClient.current?.connected ? 'Connesso' : 'Disconnesso'}
                    </p>
                  </div>
                </div>
              </div>
              <UserMenu />
            </div>


            {/* Message List */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5"><MessageSquare size={48} /></div>
                  <p className="italic font-medium">Invia il primo messaggio per iniziare a organizzare l'evento.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[75%] p-5 rounded-[2rem] shadow-xl ${msg.senderId === user.id ? 'bg-easygig-accent text-white rounded-tr-none shadow-indigo-500/10' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-black/20'}`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[9px] mt-3 font-bold uppercase opacity-40 ${msg.senderId === user.id ? 'text-right' : 'text-left'}`}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>

            {/* Message Input */}
            <div className="p-8 bg-slate-950/50 border-t border-white/5 backdrop-blur-xl">
              <div className="max-w-4xl mx-auto relative group">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Scrivi un messaggio..." 
                  className="w-full bg-slate-800/80 border border-white/10 rounded-[2.5rem] py-6 pl-10 pr-24 outline-none focus:ring-2 focus:ring-easygig-accent/50 focus:bg-slate-800 transition-all text-lg placeholder:text-slate-600 shadow-inner"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !stompClient.current?.connected}
                  className="absolute right-4 top-4 bg-easygig-accent hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-easygig-accent p-4 rounded-2xl shadow-2xl shadow-indigo-500/30 transition-all active:scale-95"
                >
                  <Send size={24} className="text-white" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-600 mt-4 uppercase font-bold tracking-[0.2em]">
                I messaggi sono crittografati e sicuri
              </p>
            </div>
          </>
        ) : (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="w-40 h-40 bg-slate-900 border border-white/5 rounded-[4rem] flex items-center justify-center mx-auto text-slate-800 shadow-2xl">
              <MessageSquare size={80} />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Messaggistica Real-time</h2>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">
                Seleziona una prenotazione accettata per discutere i dettagli tecnici e logistici dell'evento.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-easygig-accent/10 border border-easygig-accent/20 px-4 py-2 rounded-full text-[10px] font-black uppercase text-easygig-accent tracking-widest">
               Connessione Sicura Attiva
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
