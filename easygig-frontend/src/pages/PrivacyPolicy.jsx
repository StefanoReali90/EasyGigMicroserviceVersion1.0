import { Music, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trasparenza & Sicurezza</span>
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Privacy Policy</h1>
          <p className="text-slate-500 font-medium italic">Ultimo aggiornamento: 12 Maggio 2026</p>
        </header>

        <div className="bg-easygig-card border border-white/5 rounded-[3rem] p-10 lg:p-16 space-y-10 shadow-2xl leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">1. Informazioni Generali</h2>
            <p>
              Benvenuto su <strong>EasyGIG</strong>. La tua privacy è di fondamentale importanza per noi. 
              Questa informativa descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali quando utilizzi la nostra piattaforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">2. Dati Raccolti</h2>
            <p>Raccogliamo le seguenti categorie di dati:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Informazioni di Identificazione:</strong> Nome, cognome, indirizzo email.</li>
              <li><strong>Dati del Profilo:</strong> Foto, biografia, generi musicali, cachet (per gli artisti).</li>
              <li><strong>Dati di Navigazione:</strong> Indirizzo IP, tipo di browser, orari di accesso.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">3. Utilizzo dei Dati</h2>
            <p>Utilizziamo i tuoi dati esclusivamente per:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fornire i nostri servizi di booking e messaggistica.</li>
              <li>Personalizzare la tua esperienza sulla piattaforma.</li>
              <li>Garantire la sicurezza e prevenire attività fraudolente.</li>
              <li>Inviarti notifiche relative ai tuoi live o alla gestione dell'account.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">4. Protezione dei Dati</h2>
            <p>
              Adottiamo misure di sicurezza all'avanguardia, tra cui la crittografia dei dati e protocolli di autenticazione sicuri (JWT), 
              per proteggere le tue informazioni da accessi non autorizzati.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">5. I tuoi Diritti</h2>
            <p>
              Ai sensi del GDPR, hai il diritto di accedere, rettificare o cancellare i tuoi dati personali in qualsiasi momento 
              direttamente dalla sezione <strong>"Il mio Profilo"</strong> del tuo account.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-white/5">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Contatti</h2>
            <p>Per qualsiasi domanda relativa alla privacy, contattaci a: <span className="text-easygig-accent font-bold">privacy@easygig.it</span></p>
          </section>
        </div>

      </div>
    </div>
  );
}
