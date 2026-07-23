import { AlertTriangle, X } from 'lucide-react';

/**
 * Modal riutilizzabile per la cancellazione di un booking.
 * Gestisce automaticamente la logica visiva di "Late Cancellation" (< 48h).
 *
 * @param {boolean}  isOpen                   - Visibilità del modal
 * @param {function} onClose                  - Callback di chiusura
 * @param {function} onConfirm                - Callback di conferma con (reason: string)
 * @param {string}   [cancelReason]           - Valore corrente del motivo
 * @param {function} [onReasonChange]         - Setter del motivo
 * @param {string}   [slotStart]              - ISO datetime dell'evento (per rilevare late cancellation)
 * @param {string}   [title]                  - Titolo del modal
 * @param {string}   [lateWarningMessage]     - Messaggio di avviso per late cancellation
 * @param {string}   [confirmLabel]           - Label del pulsante di conferma
 * @param {boolean}  [isSubmitting]           - Stato di caricamento
 */
export default function CancelModal({
  isOpen,
  onClose,
  onConfirm,
  cancelReason = '',
  onReasonChange,
  slotStart,
  title = 'Cancella Prenotazione',
  lateWarningMessage,
  confirmLabel = 'Conferma Cancellazione',
  isSubmitting = false,
  disableOnLateCancellation = false,
}) {
  if (!isOpen) return null;

  const isLateCancellation = (() => {
    if (!slotStart) return false;
    const eventDate = new Date(slotStart);
    const diffTime = eventDate - new Date();
    return diffTime / (1000 * 60 * 60 * 24) < 2;
  })();

  const defaultLateWarning =
    'Mancano meno di **48 ore** all\'evento. Cancellando ora riceverai automaticamente **1 STRIKE** sulla tua reputazione.';

  const isConfirmDisabled = isSubmitting || (isLateCancellation && disableOnLateCancellation);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4 text-rose-500">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h3>
          </div>
          <button
            id="cancel-modal-close"
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Late cancellation warning */}
          {isLateCancellation ? (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-3">
              <p className="text-rose-500 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <AlertTriangle size={14} /> Attenzione: Late Cancellation
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {lateWarningMessage || defaultLateWarning}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm leading-relaxed">
              Sei sicuro di voler cancellare questa prenotazione? Il destinatario verrà notificato immediatamente.
            </p>
          )}

          {/* Reason textarea */}
          {!(isLateCancellation && disableOnLateCancellation) && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Motivo della cancellazione
              </label>
              <textarea
                id="cancel-modal-reason"
                rows="3"
                placeholder="Esempio: emergenza personale, problemi tecnici..."
                value={cancelReason}
                onChange={(e) => onReasonChange?.(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              id="cancel-modal-back"
              onClick={onClose}
              className="flex-1 bg-white/5 font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-white/10 transition-all text-white"
            >
              Indietro
            </button>
            <button
              id="cancel-modal-confirm"
              onClick={() => onConfirm(cancelReason)}
              disabled={isConfirmDisabled}
              className="flex-1 bg-rose-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'In corso...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
