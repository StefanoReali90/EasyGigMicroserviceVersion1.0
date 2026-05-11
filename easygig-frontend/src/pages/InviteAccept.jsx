import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import * as invitationApi from '../api/invitations';
import { Loader2, Music, CheckCircle2, XCircle } from 'lucide-react';

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    const processInvitation = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      if (!user) {
        // Se l'utente non è loggato, salviamo il token e mandiamolo alla registrazione
        localStorage.setItem('pendingInvitationToken', token);
        navigate('/register');
        return;
      }

      try {
        await invitationApi.acceptInvitation(token, user.id);
        setStatus('success');
        setTimeout(() => navigate('/dashboard/artist'), 2000);
      } catch (error) {
        console.error("Errore accettazione invito:", error);
        setStatus('error');
      }
    };

    processInvitation();
  }, [token, user, navigate]);

  return (
    <div className="min-h-screen bg-easygig-dark text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 p-12 rounded-[3rem] text-center shadow-2xl">
        <Music className="w-12 h-12 text-easygig-accent mx-auto mb-8" />
        
        {status === 'processing' && (
          <div className="space-y-6">
            <Loader2 className="w-12 h-12 text-easygig-accent animate-spin mx-auto" />
            <h2 className="text-2xl font-bold">Elaborazione Invito...</h2>
            <p className="text-slate-400">Stiamo verificando le tue credenziali per aggiungerti alla band.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-emerald-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-emerald-400">Invito Accettato!</h2>
            <p className="text-slate-400">Benvenuto nella tua nuova band. Verrai reindirizzato alla dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-rose-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-rose-500">
              <XCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-rose-400">Invito non valido</h2>
            <p className="text-slate-400">Il token potrebbe essere scaduto o già utilizzato. Contatta il leader della band.</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold transition-all"
            >
              Torna alla Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
