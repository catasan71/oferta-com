import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  MessageSquarePlus,
  PenTool,
  Check,
  AlertCircle,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  Info,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { Quote, QuoteItem, SubscriptionPlan } from '../types.ts';
import { calculateQuoteTotals, formatCurrency, formatDate } from '../lib/calculations.ts';
import { SignaturePad } from './SignaturePad.tsx';
import { FeedbackModal } from './FeedbackModal.tsx';
import { PrintExportModal } from './PrintExportModal.tsx';
import { ShareQuoteModal } from './ShareQuoteModal.tsx';

interface PublicQuoteViewProps {
  quote: Quote;
  subscriptionPlan: SubscriptionPlan;
  onUpdateQuote: (updatedQuote: Quote) => void;
  onBackToDashboard?: () => void;
  isClientView?: boolean;
}

export const PublicQuoteView: React.FC<PublicQuoteViewProps> = ({
  quote,
  subscriptionPlan,
  onUpdateQuote,
  onBackToDashboard,
  isClientView = false,
}) => {
  const [items, setItems] = useState<QuoteItem[]>(quote.items);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSignedSuccessModalOpen, setIsSignedSuccessModalOpen] = useState(false);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<QuoteItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verificăm dacă linkul a fost deschis ca un link public / client
  const isClientMode =
    isClientView ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.includes('/view/') ||
        window.location.hash.includes('/view/')));

  const org = quote.organization;
  const brandColor = subscriptionPlan === 'STARTER' ? org?.brand_color || '#2563eb' : '#2563eb';
  const isWhiteLabel = subscriptionPlan === 'STARTER';

  // Înregistrare automată la prima deschidere din sesiune
  useEffect(() => {
    const sessionKey = `viewed_${quote.id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true');
      
      const newViewCount = (quote.view_count || 0) + 1;
      const updated = {
        ...quote,
        view_count: newViewCount,
        status: quote.status === 'DRAFT' || quote.status === 'SENT' ? ('VIEWED' as const) : quote.status,
      };
      onUpdateQuote(updated);
    }

    // Declanșare automată dialog print dacă parametrul ?print=true este prezent în URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('print') === 'true') {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.error(e);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [quote.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Comutare articol opțional de către client
  const toggleOptionalItem = (itemId: string) => {
    if (quote.status === 'ACCEPTED') return; // Nu se mai pot schimba dacă e deja semnată
    const updated = items.map((it) => {
      if (it.id === itemId && it.este_optional) {
        return { ...it, este_selectat: !it.este_selectat };
      }
      return it;
    });
    setItems(updated);

    // Recalculare totaluri
    const totals = calculateQuoteTotals(updated);
    onUpdateQuote({
      ...quote,
      items: updated,
      valoare_totala: totals.totalGeneral,
      valoare_tva: totals.totalTva,
    });
  };

  // Tratare semnare digitală
  const handleSignConfirm = (signatureDataUrl: string, signerName: string, signerRole: string) => {
    const signatureRecord = {
      id: `sig_${Date.now()}`,
      quoteId: quote.id,
      semnatar_nume: signerName,
      semnatar_functie: signerRole,
      ip_address: '86.120.45.192',
      user_agent: navigator.userAgent,
      semnat_la: new Date().toISOString(),
      semnatura_data_url: signatureDataUrl,
    };

    const updated = {
      ...quote,
      status: 'ACCEPTED' as const,
      signature: signatureRecord,
      items: items,
      updated_at: new Date().toISOString(),
    };

    onUpdateQuote(updated);
    setIsSignModalOpen(false);
    setIsSignedSuccessModalOpen(true);
    showToast('Oferta a fost semnată cu succes! Certificatul de semnare digitală a fost emis.');
  };

  // Tratare obiecțiune / comentariu feedback
  const handleSubmitFeedback = (message: string, itemId?: string | null) => {
    const newFeedback = {
      id: `fb_${Date.now()}`,
      quoteId: quote.id,
      quoteItemId: itemId || null,
      autor: 'CLIENT' as const,
      mesaj: message,
      status: 'OPEN' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = {
      ...quote,
      status: 'NEGOTIATION' as const,
      feedbacks: [...(quote.feedbacks || []), newFeedback],
      updated_at: new Date().toISOString(),
    };

    onUpdateQuote(updated);
    showToast('Solicitarea a fost transmisă! Statusul ofertei este acum în Negociere.');
  };

  const totals = calculateQuoteTotals(items);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8 text-slate-900 print:bg-white print:p-0 print:m-0">
      {/* Toast Notificare */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Bară de navigare curată deasupra documentului */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          {!isClientMode && onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs cursor-pointer mr-1"
            >
              ← Înapoi la Panou
            </button>
          )}

          {!isClientMode && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer mr-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              Trimite Link
            </button>
          )}

          <span className="font-semibold text-slate-700">Document Ofertă:</span>
          <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-slate-800">
            #{quote.numar_oferta}
          </span>
          {quote.expires_at && (
            <span className="text-slate-400 hidden sm:inline">
              • Valabilă până la {formatDate(quote.expires_at)}
            </span>
          )}
        </div>

        {/* Butoanele de acțiune pentru client */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Tipărește / Salvează PDF A4
          </button>

          {quote.status !== 'ACCEPTED' && (
            <>
              <button
                onClick={() => {
                  setSelectedFeedbackItem(null);
                  setIsFeedbackModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-50 shadow-sm transition-all cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4 text-amber-600" />
                Solicită Modificare
              </button>

              <button
                onClick={() => setIsSignModalOpen(true)}
                style={{ backgroundColor: brandColor }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                Semnează Online
              </button>
            </>
          )}

          {quote.status === 'ACCEPTED' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Ofertă Semnată Digital
            </div>
          )}
        </div>
      </div>

      {/* CONTAINERUL DOCUMENTULUI A4 */}
      <div
        id="quote-document-paper"
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none"
      >
        {/* Antet Brand / White-Label */}
        <div
          className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6"
          style={{
            borderTop: `6px solid ${brandColor}`,
          }}
        >
          <div className="flex items-center gap-4">
            {org?.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.nume}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                {org?.nume?.slice(0, 2).toUpperCase() || 'OF'}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{org?.nume || 'Companie Emitentă'}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>CUI: {org?.cui}</span>
                {org?.reg_com && <span>• {org.reg_com}</span>}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1"
              style={{
                backgroundColor: `${brandColor}15`,
                color: brandColor,
              }}
            >
              Ofertă Comercială
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">{quote.numar_oferta}</div>
            <p className="text-xs text-slate-500">Emisă la: {formatDate(quote.created_at)}</p>
          </div>
        </div>

        {/* Informații Părți (Emitent & Beneficiar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 bg-slate-50/70 border-b border-slate-200/80 text-xs">
          {/* Furnizor */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Furnizor (Emitent)</p>
            <p className="font-bold text-slate-800 text-sm">{org?.nume}</p>
            <p className="text-slate-600">{org?.adresa || 'Sediul social specificat în contract'}</p>
            <p className="text-slate-600">IBAN: <strong className="font-mono text-slate-800">{org?.iban || 'RO00AAAA0000000000000000'}</strong></p>
          </div>

          {/* Beneficiar / Client */}
          <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Beneficiar (Client)</p>
            <p className="font-bold text-slate-800 text-sm">{quote.client_name}</p>
            {quote.client_cui && <p className="text-slate-600">CUI: <strong>{quote.client_cui}</strong></p>}
            {quote.client_email && (
              <p className="text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{quote.client_email}</span>
              </p>
            )}
            {quote.client_phone && (
              <p className="text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{quote.client_phone}</span>
              </p>
            )}
            <p className="text-slate-500 pt-1">
              Valabilitate ofertă: <strong className="text-amber-800">{formatDate(quote.expires_at)}</strong>
            </p>
          </div>
        </div>

        {/* Titlu & Prezentare Ofertă */}
        <div className="px-8 pt-6 pb-2">
          <h2 className="text-lg font-bold text-slate-900">{quote.titlu}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Vă rugăm să analizați lista articolelor propuse. Articolele marcate cu eticheta <em>Opțional</em> pot fi debifate direct din tabel pentru recalcularea automată a valorii totale.
          </p>
        </div>

        {/* Tabel Articole Ofertă */}
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 w-10 text-center">#</th>
                  <th className="pb-3">Descriere Produs / Serviciu</th>
                  <th className="pb-3 text-center">Cant.</th>
                  <th className="pb-3 text-right">Preț Unitar</th>
                  <th className="pb-3 text-center">Disc.</th>
                  <th className="pb-3 text-right">Valoare ({quote.moneda})</th>
                  <th className="pb-3 text-center print:hidden">Opțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const isExcluded = item.este_optional && !item.este_selectat;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isExcluded ? 'bg-slate-50/60 opacity-60 line-through text-slate-400' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-4 pr-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                              <span>{item.titlu}</span>
                              {item.este_optional && (
                                <span className="no-underline inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  Opțional
                                </span>
                              )}
                            </div>
                            {item.descriere && (
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-normal no-underline">
                                {item.descriere}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center font-mono">
                        {item.cantitate}
                      </td>
                      <td className="py-4 text-right font-mono">
                        {formatCurrency(item.pret_unitar, quote.moneda)}
                      </td>
                      <td className="py-4 text-center font-mono text-slate-500">
                        {item.discount_procent > 0 ? `${item.discount_procent}%` : '-'}
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(item.total, quote.moneda)}
                      </td>
                      <td className="py-4 text-center print:hidden pl-2">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.este_optional && quote.status !== 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => toggleOptionalItem(item.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all no-underline ${
                                item.este_selectat
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {item.este_selectat ? '✓ Inclus' : '+ Include'}
                            </button>
                          )}
                          {quote.status !== 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFeedbackItem(item);
                                setIsFeedbackModalOpen(true);
                              }}
                              title="Adaugă obiecțiune sau întrebare pe această linie"
                              className="p-1 text-slate-400 hover:text-amber-600 transition-colors rounded"
                            >
                              <MessageSquarePlus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sumar & Totaluri */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="max-w-xs text-xs text-slate-500 space-y-2">
              {quote.termeni_plata && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-semibold text-slate-700 mb-0.5">Termeni și Condiții de Plată:</p>
                  <p className="leading-relaxed">{quote.termeni_plata}</p>
                </div>
              )}
              {totals.totalOptionalNeinclus > 0 && (
                <p className="text-[11px] text-amber-700">
                  * Ați exclus articole opționale în valoare de <strong>{formatCurrency(totals.totalOptionalNeinclus, quote.moneda)}</strong>.
                </p>
              )}
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Net:</span>
                <span className="font-mono font-semibold">{formatCurrency(totals.subtotal, quote.moneda)}</span>
              </div>
              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Total:</span>
                  <span className="font-mono font-semibold">-{formatCurrency(totals.totalDiscount, quote.moneda)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>TVA (19%):</span>
                <span className="font-mono font-semibold">{formatCurrency(totals.totalTva, quote.moneda)}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline text-slate-900 font-bold">
                <span className="text-sm">Total General:</span>
                <span
                  className="text-lg font-black font-mono"
                  style={{ color: brandColor }}
                >
                  {formatCurrency(totals.totalGeneral, quote.moneda)}
                </span>
              </div>
            </div>
          </div>

          {/* Certificat Semnătură Digitală dacă este semnată */}
          {quote.signature && (
            <div className="mt-8 p-6 bg-emerald-50/80 rounded-2xl border-2 border-emerald-300/80">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                      Certificat de Semnătură Digitală
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Document acceptat și securizat prin platforma OfferFlow
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300">
                  ID: {quote.signature.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="space-y-1">
                  <p>Semnatar: <strong>{quote.signature.semnatar_nume}</strong></p>
                  {quote.signature.semnatar_functie && (
                    <p>Funcție: <strong>{quote.signature.semnatar_functie}</strong></p>
                  )}
                  <p>Dată și oră: <strong>{new Date(quote.signature.semnat_la).toLocaleString('ro-RO')}</strong></p>
                  <p className="font-mono text-[11px] text-slate-500">Adresă IP: {quote.signature.ip_address}</p>
                </div>

                <div className="flex flex-col items-center sm:items-end justify-center">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">Semnătură Olografă Înregistrată:</p>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-sm max-w-[200px]">
                    <img
                      src={quote.signature.semnatura_data_url}
                      alt="Semnătură"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Branding OfferFlow (dacă e pe planul FREE) */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          {!isWhiteLabel ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                Generat prin OfferFlow
              </span>
              <span>Platformă SaaS B2B pentru ofertare rapidă și semnare online</span>
            </div>
          ) : (
            <div className="text-slate-400 text-[11px]">
              {org?.nume} • Document cu valoare de ofertă comercială fermă
            </div>
          )}

          <div className="flex items-center gap-4 text-[11px]">
            <span>Securitate SSL 256-bit</span>
            <span>•</span>
            <span>Audit Trail EIDAS</span>
          </div>
        </div>
      </div>

      {/* Modale */}
      {isSignModalOpen && (
        <SignaturePad
          onConfirm={handleSignConfirm}
          onCancel={() => setIsSignModalOpen(false)}
          initialName={quote.client_name}
          brandColor={brandColor}
        />
      )}

      {isFeedbackModalOpen && (
        <FeedbackModal
          quote={quote}
          selectedItem={selectedFeedbackItem}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmitFeedback={handleSubmitFeedback}
          brandColor={brandColor}
        />
      )}

      {isPrintModalOpen && (
        <PrintExportModal
          quote={quote}
          elementId="quote-document-paper"
          onClose={() => setIsPrintModalOpen(false)}
          onToast={showToast}
        />
      )}

      {isShareModalOpen && (
        <ShareQuoteModal
          quote={quote}
          onClose={() => setIsShareModalOpen(false)}
          onToast={showToast}
        />
      )}

      {/* Modal Confirmare Semnare Digitală (pentru client) */}
      {isSignedSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Ofertă Acceptată & Semnată
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                Document Semnat cu Succes!
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Semnătura dumneavoastră a fost înregistrată oficial. Statusul ofertei a fost actualizat automat în <strong>ACCEPTATĂ</strong>, iar notificarea și certificatul digital au fost transmise către <strong>{org?.nume || 'furnizor'}</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Număr Ofertă:</span>
                <strong className="text-slate-800 font-mono">{quote.numar_oferta}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Semnatar:</span>
                <strong className="text-slate-800">{quote.signature?.semnatar_nume || 'Reprezentant Legal'}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Data & Ora:</span>
                <strong className="text-slate-800">{new Date().toLocaleString('ro-RO')}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Furnizor Notificat:</span>
                <strong className="text-emerald-700">{org?.nume}</strong>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignedSuccessModalOpen(false);
                  setIsPrintModalOpen(true);
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Descarcă Exemplarul PDF Semnat
              </button>

              {quote.organization?.telefon && (
                <a
                  href={`https://wa.me/${quote.organization.telefon.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Bună ziua! Am semnat oficial oferta comercială ${quote.numar_oferta} emisă de ${org?.nume}. Documentul este acceptat!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Trimite Notificare Rapidă pe WhatsApp Furnizorului
                </a>
              )}

              <button
                type="button"
                onClick={() => setIsSignedSuccessModalOpen(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
