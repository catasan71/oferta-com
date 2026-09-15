import React, { useState } from 'react';
import { MessageSquarePlus, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Quote, QuoteItem, QuoteFeedback } from '../types.ts';

interface FeedbackModalProps {
  quote: Quote;
  selectedItem?: QuoteItem | null;
  onClose: () => void;
  onSubmitFeedback: (message: string, itemId?: string | null) => void;
  brandColor?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  quote,
  selectedItem,
  onClose,
  onSubmitFeedback,
  brandColor = '#2563eb',
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitFeedback(message.trim(), selectedItem?.id || null);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const existingFeedbacks = quote.feedbacks || [];
  const relevantFeedbacks = selectedItem
    ? existingFeedbacks.filter((f) => f.quoteItemId === selectedItem.id)
    : existingFeedbacks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">
                {selectedItem ? `Comentariu: ${selectedItem.titlu}` : 'Solicitare Modificare / Negociere'}
              </h3>
              <p className="text-xs text-slate-400">Oferta #{quote.numar_oferta} • Notificare instant către emitent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-sm px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Istoric comentarii dacă există */}
        {relevantFeedbacks.length > 0 && (
          <div className="px-6 pt-4 pb-2 max-h-48 overflow-y-auto space-y-2 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Comentarii anterioare</p>
            {relevantFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className={`p-3 rounded-xl text-xs space-y-1 ${
                  fb.autor === 'CLIENT'
                    ? 'bg-blue-50 border border-blue-100 text-blue-900 ml-4'
                    : 'bg-emerald-50 border border-emerald-100 text-emerald-900 mr-4'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-[11px]">
                  <span>{fb.autor === 'CLIENT' ? 'Dumneavoastră (Client)' : 'Emitent Ofertfă'}</span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(fb.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="leading-relaxed">{fb.mesaj}</p>
              </div>
            ))}
          </div>
        )}

        {/* Formular nou feedback */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mesajul sau propunerea de modificare:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrieți aici obiecțiunile sau modificările dorite (ex: solicitare discount, extindere termen, ajustare cantitate sau clarificări)..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <MessageCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Trimiterea acestui mesaj va schimba automat statusul ofertei în <strong>NEGOCIERE</strong> și va transmite notificarea către reprezentantul emitent.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Închide
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              style={{ backgroundColor: brandColor }}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white flex items-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Se transmite...' : 'Trimite Solicitarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
