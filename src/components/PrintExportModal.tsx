import React from 'react';
import {
  FileText,
  Printer,
  ExternalLink,
  X,
} from 'lucide-react';
import { Quote } from '../types.ts';

interface PrintExportModalProps {
  quote: Quote;
  elementId?: string;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  quote,
  onClose,
  onToast,
}) => {
  const handleNativePrint = () => {
    try {
      window.print();
      onToast('Comanda de tipărire a fost trimisă către browser.');
    } catch (e) {
      console.error(e);
      onToast('Tipărirea în iframe este restricționată. Deschideți oferta în filă nouă.');
    }
  };

  const handleOpenInNewTab = (autoPrint: boolean = true) => {
    const query = autoPrint ? '?print=true' : '';
    const publicUrl = `${window.location.origin}/view/${quote.public_token}${query}`;
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Antet Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tipărire &amp; Salvare PDF A4</h3>
              <p className="text-xs text-slate-300">Oferta #{quote.numar_oferta} • Format vectorial A4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corp Modal */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-0.5">Format A4 Vectorial Standard (Calitate Maximă)</p>
              Documentul exportat păstrează cu fidelitate 100% designul oficial: antetul companiei, fonturile vectoriale clare, diacriticele românești corecte, tabelele de prețuri, totalurile cu TVA și certificatul de audit electronic.
            </div>
          </div>

          {/* Tipărire & Salvare PDF prin Browser */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tipărire sau Salvare PDF prin Browser
                </span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Recomandat
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Deschide oferta în format nativ A4 de unde puteți alege <strong>„Save as PDF” / „Salvare ca PDF”</strong> sau trimite direct către imprimantă la rezoluție maximă.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleNativePrint}
                className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                Tipărește direct
              </button>

              <button
                type="button"
                onClick={() => handleOpenInNewTab(true)}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                title="Deschide pagina și pornește automat dialogul de salvare / print"
              >
                <ExternalLink className="w-4 h-4" />
                Deschide cu dialog Print
              </button>
            </div>
          </div>
        </div>

        {/* Subsol Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};
