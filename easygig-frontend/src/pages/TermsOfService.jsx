import { Music, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-easygig-dark text-slate-300 font-sans p-6 lg:p-12 selection:bg-easygig-accent/30">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Torna indietro
        </button>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 mb-4 bg-white/5 px-4 py-2 rounded-full border border-white/5">
             <Music size={16} className="text-easygig-accent" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Regole della Community</span>
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Termini di Servizio</h1>
          <p className="text-slate-500 font-medium italic">Ultimo aggiornamento: 12 Maggio 2026</p>
        </header>

        <div className="bg-easygig-card border border-white/5 rounded-[3rem] p-10 lg:p-16 space-y-10 shadow-2xl leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">1. Accettazione dei Termini</h2>
            <p>
              Utilizzando <strong>EasyGIG</strong>, accetti di rispettare questi termini e condizioni. Se non accetti queste regole, non potrai utilizzare la piattaforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">2. Comportamento dell'Utente</h2>
            <p>Gli utenti si impegnano a:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fornire informazioni veritiere durante la registrazione.</li>
              <li>Non caricare materiale protetto da copyright senza autorizzazione.</li>
              <li>Rispettare gli impegni presi durante la fase di booking.</li>
              <li>Mantenere un comportamento professionale nei messaggi.</li>
            </ul>
          </section>

          <section className="space-y-4 text-amber-500">
            <h2 className="text-2xl font-black uppercase tracking-tight">3. Sistema di Penalità (Strikes)</h2>
            <p>
              Per garantire la qualità del servizio, EasyGIG adotta un sistema a 3 strikes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 font-bold">
              <li>Cancellazione ingiustificata di un live con meno di 48h di preavviso.</li>
              <li>Comportamento abusivo o spam.</li>
              <li>Mancata presentazione a un evento confermato.</li>
            </ul>
            <p className="text-sm italic">Al terzo strike, il profilo verrà sospeso permanentemente.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">4. Responsabilità</h2>
            <p>
              EasyGIG è un intermediario che facilita l'incontro tra domanda e offerta. Non siamo responsabili per l'esito tecnico degli eventi o per dispute contrattuali tra le parti.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">5. Modifiche ai Termini</h2>
            <p>
              Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Gli utenti verranno notificati via email o tramite notifica in-app.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-white/5">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Supporto Legale</h2>
            <p>Per controversie o assistenza: <span className="text-easygig-accent font-bold">legal@easygig.it</span></p>
          </section>
        </div>

      </div>
    </div>
  );
}
