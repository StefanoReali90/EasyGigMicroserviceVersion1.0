/**
 * Card statistica condivisa tra tutte le dashboard.
 *
 * @param {string}        label       - Etichetta della metrica
 * @param {string|number} value       - Valore da mostrare
 * @param {ReactNode}     [icon]      - Icona opzionale (Lucide)
 * @param {string}        [trend]     - Testo tendenza (es. "+12% questo mese")
 * @param {string}        [color]     - Classe Tailwind bg-gradient (es. "from-emerald-500/20 to-emerald-500/5")
 * @param {string}        [text]      - Classe Tailwind per il colore del valore (es. "text-emerald-500")
 */
export default function StatCard({ label, value, icon, trend, color, text }) {
  // Variante con icona (DirectorDashboard)
  if (icon !== undefined) {
    return (
      <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl group hover:border-easygig-accent/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {trend && (
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{trend}</span>
          )}
        </div>
        <div>
          <p className="text-3xl font-black tracking-tight text-white">{value}</p>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">{label}</p>
        </div>
      </div>
    );
  }

  // Variante con gradient colorato (ArtistDashboard)
  return (
    <div className={`bg-gradient-to-br ${color} border border-white/5 p-6 rounded-3xl`}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${text}`}>{value}</p>
      {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
    </div>
  );
}
