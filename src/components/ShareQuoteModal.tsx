import React, { useState, useRef } from 'react';
import {
  Share2,
  Copy,
  Check,
  Mail,
  MessageCircle,
  ExternalLink,
  X,
  ShieldCheck,
  Send,
  ChevronDown,
  Sparkles,
  Eye,
  FileCheck2,
  CheckCheck,
  CheckCircle2,
  Code,
} from 'lucide-react';
import { Quote } from '../types.ts';
import { formatCurrency, formatDate } from '../lib/calculations.ts';
import { generatePlainTextEmail, generateHtmlEmail } from '../lib/emailTemplate.ts';

interface ShareQuoteModalProps {
  quote: Quote;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export const ShareQuoteModal: React.FC<ShareQuoteModalProps> = ({
  quote,
  onClose,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [copiedRichHtml, setCopiedRichHtml] = useState(false);
  const [showHtmlCodeModal, setShowHtmlCodeModal] = useState(false);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(true);
  const previewCardRef = useRef<HTMLDivElement>(null);
  const publicUrl = `${window.location.origin}/view/${quote.public_token}`;

  const emailSubject = `Ofertă Comercială ${quote.numar_oferta} - ${quote.titlu}`;
  const messageText = generatePlainTextEmail(quote, publicUrl);
  const htmlEmailContent = generateHtmlEmail(quote, publicUrl);
  const orgName = quote.organization?.nume || 'Compania noastră';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    onToast?.('Linkul public a fost copiat în clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    onToast?.('Mesajul complet cu link evidențiat a fost copiat!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyEmailData = () => {
    navigator.clipboard.writeText(`Subiect: ${emailSubject}\n\n${messageText}`);
    setCopiedEmailText(true);
    onToast?.('Subiectul și corpul emailului au fost copiate!');
    setTimeout(() => setCopiedEmailText(false), 2500);
  };

  // Copiere Rich HTML în clipboard - permite paste direct în Outlook/Gmail/Apple Mail cu card vizual și butoane!
  const handleCopyRichHtml = async () => {
    try {
      // Metoda 1: ClipboardItem cu text/html
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        const blobHtml = new Blob([htmlEmailContent], { type: 'text/html' });
        const blobText = new Blob([messageText], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ]);
        setCopiedRichHtml(true);
        onToast?.('Cardul grafic a fost copiat! Poți da Paste (Ctrl+V) direct în Outlook sau Gmail.');
        setTimeout(() => setCopiedRichHtml(false), 3000);
        return;
      }
      
      // Metoda 2: Selection / execCommand copy pe DOM-ul vizual direct
      if (previewCardRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(previewCardRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
        const successful = document.execCommand('copy');
        selection?.removeAllRanges();
        if (successful) {
          setCopiedRichHtml(true);
          onToast?.('Cardul grafic a fost copiat! Dă Paste (Ctrl+V) în email.');
          setTimeout(() => setCopiedRichHtml(false), 3000);
          return;
        }
      }

      // Metoda 3: Fallback la HTML text
      await navigator.clipboard.writeText(htmlEmailContent);
      setCopiedRichHtml(true);
      onToast?.('Codul HTML al emailului a fost copiat!');
      setTimeout(() => setCopiedRichHtml(false), 3000);
    } catch {
      // Metoda 4: Fallback la selecție DOM dacă permisiunea de clipboard a fost refuzată
      if (previewCardRef.current) {
        try {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(previewCardRef.current);
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.execCommand('copy');
          selection?.removeAllRanges();
          setCopiedRichHtml(true);
          onToast?.('Cardul grafic a fost selectat și copiat!');
          setTimeout(() => setCopiedRichHtml(false), 3000);
          return;
        } catch {
          // ignore
        }
      }
      navigator.clipboard.writeText(messageText);
      setCopiedEmailText(true);
      onToast?.('Mesajul a fost copiat!');
      setTimeout(() => setCopiedEmailText(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    const waText = `Bună ziua ${quote.client_name},\n\nVă transmitem oferta comercială *${quote.numar_oferta}* (*${quote.titlu}*), în valoare de *${formatCurrency(quote.valoare_totala, quote.moneda)}*.\n\n👉 *Puteți analiza specificațiile și semna online direct aici:*\n${publicUrl}\n\nCu stimă,\n${orgName}`;
    const encoded = encodeURIComponent(waText);
    const phoneClean = quote.client_phone?.replace(/[^0-9]/g, '') || '';
    const waUrl = phoneClean
      ? `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleEmailDefault = () => {
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(messageText);
    const mailtoUrl = `mailto:${quote.client_email || ''}?subject=${subject}&body=${body}`;

    // Deschidere sigură care funcționează și în iframe / sandbox
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Oferă feedback utilizatorului
    onToast?.('S-a deschis clientul de email cu mesajul formatat.');
  };

  const handleOpenGmail = () => {
    const to = encodeURIComponent(quote.client_email || '');
    const su = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(messageText);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handleOpenOutlook = () => {
    const to = encodeURIComponent(quote.client_email || '');
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(messageText);
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank');
  };

  const handleOpenClientView = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-6">
        {/* Antet Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Trimite Ofertă Comercială</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                  UI Modern
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Oferta #{quote.numar_oferta} • Client: {quote.client_name} • Total: {formatCurrency(quote.valoare_totala, quote.moneda)}
              </p>
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
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Notă explicativă */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-950 leading-relaxed">
              <span className="font-bold block text-blue-900 mb-0.5">Link Public Securizat &amp; Semnare Digitală pe Loc</span>
              Clientul final accesează oferta direct din telefon sau computer, fără cont sau parolă. Poate analiza articolele, bifa opționalele și semna digital.
            </div>
          </div>

          {/* Câmp Link cu buton de Copiere & Deschidere */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Linkul unic al ofertei pentru client
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 focus:outline-none select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm transition-all cursor-pointer"
                title="Copiază linkul direct"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Copiat!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiază
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Previzualizare Conținut Email Modern */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">
                  Previzualizare Email cu UI Modern &amp; Link Evidențiat
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHtmlCodeModal(true)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-300 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  title="Vezi și copiază codul sursă HTML brut"
                >
                  <Code className="w-3 h-3 text-slate-500" />
                  Sursă HTML
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {showEmailPreview ? 'Ascunde preview' : 'Afișează preview'}
                </button>
              </div>
            </div>

            {showEmailPreview && (
              <div className="p-4 bg-slate-50/50 space-y-3">
                {/* Subiect Email */}
                <div className="text-xs bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2">
                  <span className="font-bold text-slate-500 shrink-0">Subiect:</span>
                  <span className="font-semibold text-slate-900 truncate">{emailSubject}</span>
                </div>

                {/* Cardul vizual al emailului (ce va vedea clientul) */}
                <div ref={previewCardRef} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
                  {/* Header email */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 border-b-2 border-blue-600 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Ofertă Comercială Digitală
                      </span>
                      <h4 className="font-bold text-base text-white">{quote.numar_oferta}</h4>
                      <p className="text-xs text-slate-300 truncate max-w-sm">{quote.titlu}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-[11px] font-bold">
                        {orgName}
                      </span>
                    </div>
                  </div>

                  {/* Body email */}
                  <div className="p-4 space-y-3.5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Bună ziua <strong>{quote.client_name}</strong>,
                      <br />
                      Vă transmitem oferta comercială pregătită pentru dumneavoastră. Puteți analiza specificațiile, selecta opționalele dorite și semna digital documentul direct online.
                    </p>

                    {/* Caseta rezumat ofertă */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Valoare Totală:</span>
                        <span className="font-extrabold text-sm text-slate-900">
                          {formatCurrency(quote.valoare_totala, quote.moneda)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-600">
                        <span>Termen de valabilitate:</span>
                        <span className="font-semibold">
                          {quote.expires_at ? formatDate(quote.expires_at) : '30 de zile'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-600">
                        <span>Emitent:</span>
                        <span className="font-semibold">{orgName}</span>
                      </div>
                    </div>

                    {/* BUTON MARE EVIDENȚIAT CTA */}
                    <div className="py-2 text-center">
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer no-underline"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        👉 Deschide &amp; Semnează Oferta Online
                      </a>
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Securizat • Fără cont • Accesibil instant pe telefon sau computer
                      </p>
                    </div>

                    {/* Link direct ca alternativă */}
                    <div className="p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-[11px]">
                      <span className="text-slate-500 font-semibold block mb-0.5">Link direct securizat:</span>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-mono underline break-all hover:text-blue-800"
                      >
                        {publicUrl}
                      </a>
                    </div>
                  </div>

                  {/* Footer card */}
                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-center text-[11px] text-slate-400">
                    {orgName} • Trimis prin platforma securizată OfferFlow
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Butoane Acțiuni Transmitere */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Opțiuni de trimitere &amp; copiere:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Buton Email Implicit & Dropdown */}
              <div className="relative">
                <div className="p-3 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl flex items-center justify-between gap-2 transition-colors">
                  <button
                    type="button"
                    onClick={handleCopyRichHtml}
                    className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                    title="Copiază cardul vizual modern cu design identic pentru a-l lipi (Paste/Ctrl+V) direct în corpul emailului"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      {copiedRichHtml ? <CheckCheck className="w-4 h-4 text-emerald-200" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-950 hover:text-blue-800 flex items-center gap-1.5">
                        {copiedRichHtml ? 'Card Grafic Copiat!' : 'Copiază Emailul Grafic (HTML)'}
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="text-[11px] text-blue-700">
                        Design identic cu preview-ul • Paste direct în Gmail/Outlook
                      </div>
                    </div>
                  </button>

                  {/* Dropdown toggle */}
                  <button
                    type="button"
                    onClick={() => setShowEmailOptions(!showEmailOptions)}
                    className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-200/70 transition-colors cursor-pointer border border-blue-200/60"
                    title="Vezi opțiuni de trimitere prin aplicație implicită, Gmail Web sau Outlook Web"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showEmailOptions ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Meniu extins dacă utilizatorul dorește Gmail / Webmail / HTML */}
                {showEmailOptions && (
                  <div className="mt-1.5 p-2 bg-white rounded-xl border border-blue-200 shadow-lg text-xs space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      type="button"
                      onClick={handleEmailDefault}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between font-medium cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        Deschide aplicația implicită de email (Mailto)
                      </span>
                      <Send className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenGmail}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center justify-between font-medium cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Compune în Gmail (Web)
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenOutlook}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between font-medium cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        Compune în Outlook / Hotmail (Web)
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl flex items-center gap-3 text-left transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 group-hover:text-emerald-800">
                    Trimite pe WhatsApp
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {quote.client_phone ? `Către ${quote.client_phone}` : 'Mesaj cu link evidențiat'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Copiere rapidă și formatare */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRichHtml}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200/70"
                title="Copiază cardul vizual pentru a-l lipi (Ctrl+V) direct în corpul emailului"
              >
                {copiedRichHtml ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Card Grafic Copiat!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Copiază Card Grafic HTML
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyEmailData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedEmailText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiat!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    Copiază Subiect + Text Formatat
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenClientView}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Deschide vizualizare client
            </button>
          </div>
        </div>

        {/* Subsol Modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Optimizat pentru desktop, Gmail, Outlook și mobil
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Închide
          </button>
        </div>
      </div>

      {/* Modal secundar pentru vizualizare / copiere Cod Sursă HTML pur */}
      {showHtmlCodeModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-sm">Cod Sursă HTML Email</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHtmlCodeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 overflow-y-auto flex-1 font-mono text-xs text-slate-300 select-all whitespace-pre-wrap">
              {htmlEmailContent}
            </div>
            <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Poți copia codul HTML pentru clienți email avansați sau newslettere.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(htmlEmailContent);
                    onToast?.('Codul HTML brut a fost copiat în clipboard!');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiază Codul HTML
                </button>
                <button
                  type="button"
                  onClick={() => setShowHtmlCodeModal(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium cursor-pointer transition-colors"
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

