import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ExternalLink,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Quote } from '../types.ts';
import { exportQuoteToPdf } from '../lib/pdfExport.ts';

interface PrintExportModalProps {
  quote: Quote;
  elementId?: string;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  quote,
  elementId = 'quote-document-paper',
  onClose,
  onToast,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<{ blobUrl: string; fileName: string } | null>(null);

  const handleGenerateAndDownload = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const result = await exportQuoteToPdf(quote, elementId);
      if (result.success && result.blobUrl && result.fileName) {
        setGeneratedPdf({
          blobUrl: result.blobUrl,
          fileName: result.fileName,
        });
        onToast(`Documentul PDF (${result.fileName}) a fost generat și descărcat!`);
      } else {
        setErrorMessage(result.error || 'Nu s-a putut genera PDF-ul. Folosiți opțiunea de deschidere în filă nouă.');
      }
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setErrorMessage('A apărut o problemă la generarea PDF-ului. Vă recomandăm deschiderea în filă nouă.');
    } finally {
      setIsGenerating(false);
    }
  };

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
              <h3 className="font-bold text-base">Tipărire & Salvare PDF A4</h3>
              <p className="text-xs text-slate-300">Oferta #{quote.numar_oferta} • Format vizual fidel A4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corp Modal */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-0.5">Format A4 Standard Profesional</p>
              Documentul exportat păstrează cu fidelitate 100% designul văzut pe ecran: antetul companiei, diacriticele românești corecte, tabelul de prețuri, totalurile cu TVA și certificatul de audit electronic.
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Opțiunea 1: Salvează fișierul PDF A4 */}
          <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-400 transition-colors bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Opțiunea 1: Descarcă fișierul PDF A4 (Design Ecran)
                </span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Design Real
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Generează un fișier PDF identic la pixel cu oferta din aplicație, la rezoluție înaltă pentru arhivare sau transmitere către clienți.
            </p>

            <button
              onClick={handleGenerateAndDownload}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-75 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Se capturează și se generează PDF-ul...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descarcă PDF A4 acum
                </>
              )}
            </button>

            {/* Linkuri de siguranță după generare (în caz că browserul blochează declanșarea în iframe) */}
            {generatedPdf && (
              <div className="mt-3.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">PDF generat cu succes: {generatedPdf.fileName}</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-normal">
                  Dacă descărcarea automată nu a pornit din cauza ferestrei iframe, apăsați pe butoanele de mai jos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href={generatedPdf.blobUrl}
                    download={generatedPdf.fileName}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Click pentru Salvare
                  </a>
                  <a
                    href={generatedPdf.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Deschide PDF-ul în tab
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Opțiunea 2: Tipărire & Deschidere în filă nouă */}
          <div className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Opțiunea 2: Tipărire sau Salvare PDF prin Browser
                </span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                Print Nativ
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Deschide oferta direct în caseta de tipărire nativă a browserului, de unde puteți alege imprimanta fizică sau „Save as PDF”.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleNativePrint}
                className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Tipărește direct
              </button>

              <button
                onClick={() => handleOpenInNewTab(true)}
                className="py-2 px-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Deschide pagina și pornește automat dialogul de salvare / print"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Deschide cu dialog Print
              </button>
            </div>
          </div>
        </div>

        {/* Subsol Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
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
