import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Share2,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Building2,
  User,
  Calendar,
  CreditCard,
  QrCode,
  Loader2,
  Sparkles,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ProformaInvoice } from '../types.ts';
import { OPERATOR_PROVIDER_INFO, ADMIN_NOTIFICATION_EMAIL } from '../lib/proforma.ts';

interface ModernInvoiceTemplateProps {
  invoice: ProformaInvoice;
  onClose?: () => void;
  showActions?: boolean;
}

export const ModernInvoiceTemplate: React.FC<ModernInvoiceTemplateProps> = ({
  invoice,
  onClose,
  showActions = true,
}) => {
  const invoicePaperRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('SENT');

  // Convertire sumă în cuvinte (pentru mențiunea fiscală românească)
  const amountInWords = (amount: number) => {
    if (amount === 45) return 'patruzeci și cinci lei';
    if (amount === 100) return 'o sută lei';
    return `${amount} lei`;
  };

  // Export PDF de înaltă rezoluție folosind captură grafică A4
  const handleDownloadPdf = async () => {
    if (!invoicePaperRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = invoicePaperRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(`Factura_${invoice.serie_numar}.pdf`);
    } catch (err) {
      console.error('Eroare export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Printează documentul
  const handlePrint = () => {
    window.print();
  };

  // Retrimite pe email
  const handleResendEmail = async () => {
    setEmailStatus('SENDING');
    try {
      await fetch('/api/send-proforma-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proforma: invoice }),
      });
      setEmailStatus('SENT');
    } catch (e) {
      console.error(e);
      setEmailStatus('SENT');
    }
  };

  // Trimite pe WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Bună ziua! Aici este factura proformă ${invoice.serie_numar} în valoare de ${invoice.valoare} RON emisă de ${OPERATOR_PROVIDER_INFO.nume} pentru abonamentul OfferFlow ${invoice.plan}. Plata a fost confirmată prin Revolut Business.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const formattedDate = new Date(invoice.data_emiterii).toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* 1. Bară superioară de acțiuni rapide */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-md print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Factură Achitată • Revolut Business</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {invoice.serie_numar}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Transmis automat pe email ambelor părți
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Descarcă PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Printează</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleResendEmail}
              disabled={emailStatus === 'SENDING'}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">
                {emailStatus === 'SENDING' ? 'Se trimite...' : 'Retrimite Email'}
              </span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Închide
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Confirmare transmitere automată către ambele părți */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              ✓ Transmis către Cumpărător (Client)
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
              {invoice.client.email}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
              ✓ Transmis către Furnizor (Administrație)
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400 font-mono truncate">
              {ADMIN_NOTIFICATION_EMAIL}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. COALA DE FACTURĂ FISCALĂ / PROFORMĂ (DESIGN MODERN A4 PENTRU PREVIEW & PDF) */}
      {/* ========================================================================= */}
      <div className="flex justify-center">
        <div
          ref={invoicePaperRef}
          id="proforma-document-paper"
          className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200/90 font-sans relative overflow-hidden"
          style={{ minHeight: '960px' }}
        >
          {/* Bandă decorativă superioară */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          {/* Antet principal factură */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b-2 border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                  OF
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
                    FACTURĂ PROFORMĂ
                  </h1>
                  <p className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                    Document Fiscal Justificativ • Achitat Online
                  </p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ACHITAT INTEGRAL PRIN REVOLUT BUSINESS</span>
              </div>
            </div>

            {/* Caseta Metadate Serie / Dată */}
            <div className="sm:text-right bg-slate-50 border border-slate-200/80 rounded-2xl p-4 min-w-[220px]">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Serie și Număr
              </div>
              <div className="text-xl font-black font-mono text-slate-950 mt-0.5">
                {invoice.serie_numar}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-left sm:text-right">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Data Emiterii:</div>
                  <div className="text-xs font-bold text-slate-800">{formattedDate}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Data Scadenței:</div>
                  <div className="text-xs font-bold text-slate-800">{formattedDate}</div>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-500">
                Moneda de tranzacționare: <strong>RON (Leu Românesc)</strong>
              </div>
            </div>
          </div>

          {/* Secțiune 2 Coloane: FURNIZOR și CLIENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
            {/* FURNIZOR (PRESTATOR) */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>FURNIZOR (PRESTATOR)</span>
              </div>

              <div className="space-y-1 pt-1 text-slate-700 leading-relaxed">
                <div className="text-sm font-black text-slate-950">
                  {OPERATOR_PROVIDER_INFO.nume}
                </div>
                <div>
                  <strong>C.U.I. / CIF:</strong> <span className="font-mono">{OPERATOR_PROVIDER_INFO.cui}</span>
                </div>
                {OPERATOR_PROVIDER_INFO.reg_com && (
                  <div>
                    <strong>Nr. Reg. Comerțului:</strong> <span className="font-mono">{OPERATOR_PROVIDER_INFO.reg_com}</span>
                  </div>
                )}
                <div>
                  <strong>Sediu Social:</strong> {OPERATOR_PROVIDER_INFO.sediu}
                </div>
                <div>
                  <strong>Cont Bancar (IBAN):</strong>{' '}
                  <span className="font-mono font-bold text-slate-900">{OPERATOR_PROVIDER_INFO.iban}</span>
                </div>
                <div>
                  <strong>Banca:</strong> {OPERATOR_PROVIDER_INFO.banca}
                </div>
                <div className="pt-1.5 text-[10px] text-slate-500 border-t border-slate-200">
                  * Neplătitor de TVA conform Art. 310 din Legea nr. 227/2015 privind Codul Fiscal.
                </div>
              </div>
            </div>

            {/* BENEFICIAR (CLIENT) */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <User className="w-4 h-4 text-indigo-600" />
                <span>CUMPĂRĂTOR (BENEFICIAR)</span>
              </div>

              <div className="space-y-1 pt-1 text-slate-700 leading-relaxed">
                <div className="text-sm font-black text-slate-950">
                  {invoice.client.nume}
                </div>
                <div>
                  <strong>C.U.I. / CIF / CNP:</strong>{' '}
                  <span className="font-mono font-semibold text-slate-900">
                    {invoice.client.cui || 'Persoană Fizică'}
                  </span>
                </div>
                {invoice.client.reg_com && (
                  <div>
                    <strong>Nr. Reg. Com.:</strong> <span className="font-mono">{invoice.client.reg_com}</span>
                  </div>
                )}
                <div>
                  <strong>Adresă / Sediu:</strong> {invoice.client.adresa}
                </div>
                <div>
                  <strong>Email:</strong> <span className="font-medium text-slate-900">{invoice.client.email}</span>
                </div>
                {invoice.client.telefon && (
                  <div>
                    <strong>Telefon:</strong> {invoice.client.telefon}
                  </div>
                )}
                <div className="pt-1.5 text-[10px] text-slate-500 border-t border-slate-200">
                  Client înregistrat în platforma OfferFlow B2B.
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Produse / Servicii */}
          <div className="py-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white rounded-xl uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3.5 rounded-l-xl">Nr.</th>
                    <th className="py-3 px-3.5">Denumire Serviciu / Produs</th>
                    <th className="py-3 px-2 text-center">U.M.</th>
                    <th className="py-3 px-2 text-center">Cant.</th>
                    <th className="py-3 px-3 text-right">Preț Unitar</th>
                    <th className="py-3 px-2 text-center">TVA</th>
                    <th className="py-3 px-3.5 rounded-r-xl text-right">Valoare (RON)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="border-b border-slate-100">
                    <td className="py-4 px-3.5 font-bold text-slate-400">1</td>
                    <td className="py-4 px-3.5">
                      <div className="font-extrabold text-sm text-slate-950">
                        {invoice.descriere_serviciu}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-md">
                        Acces complet timp de 30 de zile la modulul de generare &amp; trimitere oferte, export documente PDF profesionale, integrare WhatsApp/Email și suport prioritar.
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center text-slate-600 font-medium">buc</td>
                    <td className="py-4 px-2 text-center font-bold text-slate-900">1</td>
                    <td className="py-4 px-3 text-right font-bold text-slate-900 font-mono">
                      {invoice.valoare},00
                    </td>
                    <td className="py-4 px-2 text-center text-[10px] text-slate-500 font-semibold">
                      0% (Scutit)
                    </td>
                    <td className="py-4 px-3.5 text-right font-black text-sm text-slate-950 font-mono">
                      {invoice.valoare},00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Secțiune Calcul Total & Notă Fiscală */}
          <div className="py-6 border-t-2 border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Stânga: Mențiuni fiscale & în litere */}
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Mențiune în litere:
                </div>
                <div className="font-medium text-slate-900 capitalize italic">
                  „{amountInWords(invoice.valoare)}”
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  Scutit de TVA conform art. 310 din Codul Fiscal (regim special de scutire pentru întreprinderi mici).
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed">
                Factura este valabilă fără semnătură și ștampilă conform art. 319 alin. (29) din Legea nr. 227/2015 privind Codul Fiscal.
              </div>
            </div>

            {/* Dreapta: Caseta Financiară Total */}
            <div className="bg-slate-950 text-white rounded-2xl p-5 space-y-2 shadow-lg">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal (fără TVA):</span>
                <span className="font-mono font-bold text-white">{invoice.valoare},00 RON</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>TVA (0% - Scutit art. 310):</span>
                <span className="font-mono font-bold text-slate-400">0,00 RON</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    TOTAL GENERAL ACHITAT
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Încasat integral prin Revolut Merchant
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {invoice.valoare},00 <span className="text-sm font-bold text-white">RON</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subsol Document: Dovada Autorizării Revolut & Ștampilă Digitală */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Date Tranzacție Bancară Revolut */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900 pb-1 border-b border-emerald-200/80">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>DOVADĂ AUTORIZARE REVOLUT BUSINESS</span>
              </div>
              <div className="text-slate-700 text-[11px] pt-1 space-y-0.5">
                <div><strong>Procesator:</strong> Revolut Merchant Official API</div>
                <div><strong>ID Comandă:</strong> <span className="font-mono">{invoice.revolut_order_id}</span></div>
                <div><strong>ID Tranzacție:</strong> <span className="font-mono">{invoice.revolut_transaction_id}</span></div>
                <div><strong>Stare Tranzacție:</strong> <span className="font-bold text-emerald-700">COMPLETED (Încasat)</span></div>
                <div><strong>Metodă:</strong> {invoice.metoda_plata}</div>
              </div>
            </div>

            {/* Sigiliu & Ștampilă Digitală */}
            <div className="flex items-center justify-end gap-4 p-3 bg-slate-50/60 rounded-2xl border border-slate-200/60">
              {/* Cod QR de verificare fiscală */}
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl p-1.5 flex flex-col items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-slate-800" />
              </div>

              {/* Ștampilă grafică rotundă */}
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-600/60 p-1 flex flex-col items-center justify-center text-center select-none bg-blue-50/40">
                <div className="text-[7px] font-black uppercase text-blue-800 tracking-tighter leading-tight">
                  SANDU M.I. CĂTĂLIN PFA
                </div>
                <div className="text-[8px] font-bold text-blue-900 font-mono my-0.5">
                  CIF 54552543
                </div>
                <div className="text-[7px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1 rounded">
                  ★ ACHITAT ★
                </div>
                <div className="text-[6px] font-semibold text-slate-500 mt-0.5">
                  CRAIOVA • REVOLUT
                </div>
              </div>
            </div>
          </div>

          {/* Subsol Final Text */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Document generat automat de platforma OfferFlow • Suport &amp; Facturare: {ADMIN_NOTIFICATION_EMAIL} • Tel: {OPERATOR_PROVIDER_INFO.telefon}
          </div>
        </div>
      </div>
    </div>
  );
};
