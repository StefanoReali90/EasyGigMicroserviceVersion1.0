import { useState } from 'react';
import { Star, X } from 'lucide-react';

/**
 * Modal riutilizzabile per l'invio di una recensione post-evento.
 * Supporta sia il flusso Artista (recensisce Locale) che Direttore (recensisce Artista/Band).
 *
 * @param {boolean}  isOpen              - Visibilità del modal
 * @param {function} onClose             - Callback di chiusura
 * @param {function} onSubmit            - Callback di submit con ({ rating, comment })
 * @param {string}   [title]             - Titolo del modal
 * @param {string}   [placeholder]       - Placeholder della textarea
 * @param {boolean}  [isSubmitting]      - Stato di caricamento del submit
 */
export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Lascia una Recensione',
  placeholder = 'Descrivi la tua esperienza...',
  isSubmitting = false,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hovered, setHovered] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ rating, comment });
    setRating(5);
    setComment('');
  };

  const handleClose = () => {
    setRating(5);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h3>
          <button
            id="review-modal-close"
            onClick={handleClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                id={`review-star-${star}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={
                    star <= (hovered || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700'
                  }
                />
              </button>
            ))}
          </div>

          {/* Rating label */}
          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            {['', 'Pessimo', 'Scarso', 'Nella media', 'Buono', 'Eccellente'][rating]}
          </p>

          {/* Comment */}
          <textarea
            id="review-comment"
            rows="4"
            placeholder={placeholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-easygig-accent text-white resize-none transition-all"
          />

          {/* Actions */}
          <div className="flex gap-4">
            <button
              id="review-modal-cancel"
              onClick={handleClose}
              className="flex-1 bg-white/5 font-bold py-4 rounded-2xl hover:bg-white/10 transition-all text-white"
            >
              Annulla
            </button>
            <button
              id="review-modal-submit"
              onClick={handleSubmit}
              disabled={isSubmitting || comment.trim().length < 3}
              className="flex-1 bg-easygig-accent text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Invio...' : 'Invia Recensione'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
