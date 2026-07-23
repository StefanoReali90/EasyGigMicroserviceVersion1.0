import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Sei sicuro?",
  message = "Questa azione non può essere annullata.",
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  isDanger = true,
  isLoading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDanger ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conferma Azione</span>
          </div>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 btn-secondary py-2.5 text-xs"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                : 'btn-primary'
            }`}
          >
            {isLoading ? 'Elaborazione...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
