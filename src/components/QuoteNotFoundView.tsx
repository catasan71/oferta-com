import React from 'react';
import {
  FileQuestion,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface QuoteNotFoundViewProps {
  token: string;
  onExploreDemo: () => void;
  onGoHome: () => void;
  isCheckingServer?: boolean;
  onRetry?: () => void;
}

export const QuoteNotFoundView: React.FC<QuoteNotFoundViewProps> = ({
  token,
  onExploreDemo,
  onGoHome,
  isCheckingServer = false,
  onRetry,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/60 shadow-sm">
          {isCheckingServer ? (
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          ) : (
            <FileQuestion className="w-8 h-8" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isCheckingServer
              ? 'Căutăm oferta pe server...'
              : 'Oferta solicitată nu a fost găsită'}
          </h2>
          <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs rounded-full border border-slate-200 dark:border-slate-700">
            Cod: {token || 'necunoscut'}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto pt-2">
            {isCheckingServer
              ? 'Vă rugăm să așteptați câteva secunde în timp ce interogăm serverul securizat OfferFlow.'
              : 'Această ofertă comercială nu a fost identificată sau link-ul a fost generat într-un mediu privat de dezvoltare fără date sincronizate.'}
          </p>
        </div>

        {/* Notificare tehnică explicativă */}
        {!isCheckingServer && (
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/50 text-left text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              Ce puteți face:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pl-1">
              <li>
                Dacă ați primit linkul pe <strong>WhatsApp</strong> sau <strong>Email</strong>, solicitați expeditorului să vă transmită <strong>fișierul PDF</strong> al ofertei sau link-ul autonom cu date incluse.
              </li>
              <li>
                Dacă sunteți autorul ofertei, asigurați-vă că ați salvat oferta în OfferFlow și că folosiți domeniul public sau exportul PDF.
              </li>
            </ul>
          </div>
        )}

        {/* Butoane Acțiuni */}
        <div className="space-y-2 pt-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reîncearcă Căutarea</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExploreDemo}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Vizualizează o Ofertă Demo Interactivă</span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mergi la Pagina Principală OfferFlow</span>
          </button>
        </div>
      </div>
    </div>
  );
};
