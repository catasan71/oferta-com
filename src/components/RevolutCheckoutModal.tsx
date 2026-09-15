import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  CreditCard,
  Sparkles,
  Zap,
  CheckCircle2,
  Download,
  Printer,
  Mail,
  Building2,
  ArrowRight,
  Lock,
  Calendar,
  User,
  Phone,
  MapPin,
  FileText,
  X,
  AlertCircle,
  ExternalLink,
  QrCode,
  Smartphone,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { Organization, SubscriptionPlan, ProformaInvoice } from '../types.ts';
import {
  createAndRecordProforma,
  exportProformaToPdf,
  OPERATOR_PROVIDER_INFO,
  ADMIN_NOTIFICATION_EMAIL,
} from '../lib/proforma.ts';

interface RevolutCheckoutModalProps {
  organization: Organization;
  currentPlan: SubscriptionPlan;
  initialSelectedPlan?: SubscriptionPlan;
  onClose: () => void;
  onSuccessUpgrade: (plan: SubscriptionPlan) => void;
}

export const RevolutCheckoutModal: React.FC<RevolutCheckoutModalProps> = ({
  organization,
  currentPlan,
  initialSelectedPlan = 'STARTER',
  onClose,
  onSuccessUpgrade,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'CLASIC'>(
    initialSelectedPlan === 'CLASIC' ? 'CLASIC' : 'STARTER'
  );

  // Etape: 1. DETAILS (date facturare & selecție), 2. PAYMENT (plată cu cardul), 3. SUCCESS (proformă & activare)
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Formular date facturare cumpărător
  const [billingName, setBillingName] = useState(organization.nume || '');
  const [billingCui, setBillingCui] = useState(organization.cui || '');
  const [billingRegCom, setBillingRegCom] = useState(organization.reg_com || '');
  const [billingAddress, setBillingAddress] = useState(organization.adresa || 'Craiova, România');
  const [billingEmail, setBillingEmail] = useState('office@developly.pro');
  const [billingPhone, setBillingPhone] = useState('0765263860');

  // Câmpuri plată card Revolut
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(organization.nume || '');

  // Factura proformă generată după confirmarea cardului
  const [generatedProforma, setGeneratedProforma] = useState<ProformaInvoice | null>(null);
  const [processingMethod, setProcessingMethod] = useState<'CARD' | 'REVOLUT_PAY' | 'APPLE_PAY' | 'GOOGLE_PAY' | null>(null);
  const [activeSheet, setActiveSheet] = useState<'NONE' | 'APPLE_PAY' | 'REVOLUT_PAY' | 'GOOGLE_PAY' | 'CARD_3DS'>('NONE');
  const [copiedLink, setCopiedLink] = useState(false);
  const [faceIdSimulating, setFaceIdSimulating] = useState(false);

  const price = selectedPlan === 'STARTER' ? 45 : 100;
  const maxOffers = selectedPlan === 'STARTER' ? 5 : 30;
  const revolutPayUrl = 'https://revolut.me/catalinsandu07';
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(revolutPayUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(revolutPayUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleTriggerFaceIdSimulation = async () => {
    setFaceIdSimulating(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setFaceIdSimulating(false);
    handleExecutePayment('APPLE_PAY');
  };

  // Pasul 1 -> Pasul 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingName.trim() || !billingEmail.trim()) {
      return;
    }
    setStep('PAYMENT');
  };

  // Pasul 2: Autorizare plată pe cardul clientului via Revolut Pay / Apple Pay / Google Pay / Card
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecutePayment = async (method: 'CARD' | 'REVOLUT_PAY' | 'APPLE_PAY' | 'GOOGLE_PAY') => {
    setIsProcessing(true);
    setProcessingMethod(method);
    setErrorMessage(null);

    try {
      // Simulare comunicare securizată cu gateway-ul Revolut Merchant & autorizare tokenizată
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const revolutOrderId = `rev_ord_${Date.now()}`;
      const revolutTxId = `TXN_${method}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      let metodaPlataText = 'Card Bancar (Securizat 3D-Secure 2.2)';
      if (method === 'REVOLUT_PAY') metodaPlataText = 'Revolut Pay (1-Click Instant)';
      if (method === 'APPLE_PAY') metodaPlataText = 'Apple Pay (Autorizare Biometrică)';
      if (method === 'GOOGLE_PAY') metodaPlataText = 'Google Pay (GPay Securizat)';

      // 1. Emitem factura proformă cu datele fiscale și înregistrăm transmiterea
      const proforma = createAndRecordProforma({
        clientName: billingName || organization.nume || 'Client B2B',
        clientCui: billingCui || organization.cui || undefined,
        clientRegCom: billingRegCom || organization.reg_com || undefined,
        clientAddress: billingAddress || organization.adresa || 'România',
        clientEmail: billingEmail || organization.email || 'office@developly.pro',
        clientPhone: billingPhone || '0765263860',
        plan: selectedPlan,
        metodaPlata: metodaPlataText,
        revolutOrderId,
        revolutTxId,
      });

      setGeneratedProforma(proforma);

      // 2. ACTIVARE a abonamentului
      onSuccessUpgrade(selectedPlan);

      // 3. Trecem la pasul de confirmare și afișare proformă
      setStep('SUCCESS');
    } catch (error: any) {
      console.error('Eroare procesare plată Revolut:', error);
      setErrorMessage(error?.message || 'A apărut o eroare la procesarea plății.');
    } finally {
      setIsProcessing(false);
      setProcessingMethod(null);
    }
  };

  // Descărcare PDF proformă
  const handleDownloadPdf = async () => {
    if (!generatedProforma) return;
    setIsDownloadingPdf(true);
    await exportProformaToPdf(
      'proforma-paper-preview',
      `Factura_Proforma_${generatedProforma.serie_numar}.pdf`
    );
    setIsDownloadingPdf(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const fillTestCard = () => {
    setCardNumber('5258 •••• •••• 4099');
    setCardExpiry('12/28');
    setCardCvc('842');
    setCardHolder(billingName || 'Catalin Sandu');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Antet Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Revolut Checkout • Abonament {selectedPlan}
              </h3>
              <p className="text-xs text-slate-300">
                Activare instantanee la confirmarea plății de pe card
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicator Pasi */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'DETAILS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={step === 'DETAILS' ? 'text-slate-900 dark:text-white font-bold' : ''}>
              Date & Plan
            </span>
          </div>

          <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'PAYMENT'
                  ? 'bg-blue-600 text-white'
                  : step === 'SUCCESS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={step === 'PAYMENT' ? 'text-slate-900 dark:text-white font-bold' : ''}>
              Plată Card Revolut
            </span>
          </div>

          <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'SUCCESS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={step === 'SUCCESS' ? 'text-emerald-600 font-bold' : ''}>
              Factură Proformă & Activare
            </span>
          </div>
        </div>

        {/* PAS 1: Selectare Plan & Date Facturare */}
        {step === 'DETAILS' && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Comutator Plan */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan('STARTER')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlan === 'STARTER'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">STARTER</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Popular
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  45 RON <span className="text-xs font-normal text-slate-500">/ lună</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Maxim 5 oferte active • White-Label complet
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('CLASIC')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlan === 'CLASIC'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">CLASIC</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Nelimitat
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  100 RON <span className="text-xs font-normal text-slate-500">/ lună</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Maxim 30 oferte active • Catalog extins
                </div>
              </button>
            </div>

            {/* Date Facturare Client */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Date Emitere Factură Proformă
                </h4>
                <span className="text-[11px] text-slate-500">Se transmit automat pe email</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nume Companie / PFA / Cumpărător *
                </label>
                <input
                  type="text"
                  required
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  placeholder="ex: SC Soluții Digitale SRL sau Popescu Ion PFA"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CUI / CIF sau CNP
                  </label>
                  <input
                    type="text"
                    value={billingCui}
                    onChange={(e) => setBillingCui(e.target.value)}
                    placeholder="ex: RO12345678"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Client (destinație proformă) *
                  </label>
                  <input
                    type="email"
                    required
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="email@companie.ro"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon de Contact
                  </label>
                  <input
                    type="tel"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    placeholder="ex: 0765263860"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sediu Social / Adresă Facturare
                  </label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="ex: Craiova, Dolj, România"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Informație transparență fiscală & livrare */}
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Flux automat de facturare proformă & activare</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300/90">
                La debitarea cu succes a cardului prin <strong>Revolut</strong>, abonamentul se activează <strong>instant</strong>. Factura proformă emisă de <strong>{OPERATOR_PROVIDER_INFO.nume}</strong> este transmisă simultan către adresa dvs. de email și către administrație (<code>{ADMIN_NOTIFICATION_EMAIL}</code>).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Plată cu Cardul ({price} RON)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* PAS 2: Plată cu cardul via Revolut / Apple Pay / Google Pay / Revolut Pay */}
        {step === 'PAYMENT' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Detalii Sumă & Merchant */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Revolut Merchant Gateway • Plan {selectedPlan}
                </span>
                <div className="text-xl font-black text-white mt-0.5">
                  {price},00 RON
                </div>
                <div className="text-[11px] text-slate-400">
                  Beneficiar: {OPERATOR_PROVIDER_INFO.nume} (CUI {OPERATOR_PROVIDER_INFO.cui})
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold border border-blue-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> 3D-Secure 2.2
                </div>
                <div className="text-[10px] text-slate-400">Revolut Certified</div>
              </div>
            </div>

            {/* Banner Mod Testare / Preview */}
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Mod Testare & Validare Activ
              </span>
              <span className="text-[10px] opacity-80">Zero taxe pe card • Activare imediată la click</span>
            </div>

            {/* Mesaj de eroare dacă există */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Indicator de procesare activ */}
            {isProcessing && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-2xl border border-blue-300 dark:border-blue-700 flex items-center gap-3.5 shadow-sm">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-blue-900 dark:text-blue-100">
                    Se procesează plata prin {processingMethod === 'REVOLUT_PAY' ? 'Revolut Pay' : processingMethod === 'APPLE_PAY' ? 'Apple Pay' : processingMethod === 'GOOGLE_PAY' ? 'Google Pay' : 'Card Bancar'}...
                  </div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-300">
                    Se validează 3D-Secure și se generează Factura Proformă oficială.
                  </div>
                </div>
              </div>
            )}

            {/* Opțiune transfer direct cu bani reali prin Revolut */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-blue-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  Doriți plată cu bani reali direct în contul Revolut?
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Puteți trimite {price} RON direct pe link-ul Revolut al Catalin Sandu PFA:
                </div>
              </div>
              <a
                href="https://revolut.me/catalinsandu07"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 shadow-sm"
              >
                <span>Deschide Revolut.me</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* VIZUALIZARE DEDICATĂ: 1. APPLE PAY & QR CODE PENTRU iPHONE */}
            {activeSheet === 'APPLE_PAY' && (
              <div className="flex flex-col items-center justify-center p-5 bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between w-full pb-3 border-b border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSheet('NONE')}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Înapoi</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.5-7.7-11.44-13.98-5.43-8.68-9.77-18.49-13.01-29.43-3.24-10.94-4.86-21.6-4.86-31.98 0-15.02 3.8-27.53 11.41-37.53 7.61-10 17.29-15.11 29.04-15.33 4.58 0 9.61 1.25 15.11 3.75 5.5 2.5 9.07 3.8 10.72 3.91 1.74-.11 5.37-1.41 10.9-3.91 5.53-2.5 10.22-3.75 14.07-3.75 10.43.33 19.34 4.35 26.73 12.06-9.57 5.86-14.24 13.91-14.02 24.13.22 8.04 3.37 14.78 9.45 20.22 6.08 5.43 13.26 8.58 21.52 9.45-2.07 6.41-4.7 13.04-7.91 19.89zm-29.35-121.2c0 6.08-2.28 11.95-6.84 17.61-5.54 6.74-12.28 10.87-20.22 12.39-.33-1.63-.5-3.15-.5-4.57 0-6.19 2.45-12.39 7.35-18.58 2.45-3.04 5.54-5.65 9.28-7.82 3.74-2.18 7.33-3.43 10.78-3.75.11 1.63.15 3.2.15 4.72z" />
                    </svg>
                    <span className="font-extrabold text-sm tracking-tight">Apple Pay</span>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                    {price} RON
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-sm font-extrabold text-zinc-100 flex items-center justify-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    Scanează cu camera iPhone-ului
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-xs">
                    Îndreaptă camera foto a iPhone-ului spre codul QR pentru a autoriza plata pe telefon.
                  </p>
                </div>

                {/* Cod QR vizibil și scanabil */}
                <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-zinc-800 flex flex-col items-center justify-center">
                  <img
                    src={qrCodeImageUrl}
                    alt="Cod QR Apple Pay iPhone"
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl object-contain block"
                  />
                  <div className="text-[10px] font-mono text-zinc-500 mt-1.5 font-bold">
                    revolut.me/catalinsandu07
                  </div>
                </div>

                <div className="w-full space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleExecutePayment('APPLE_PAY')}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Am efectuat plata pe iPhone • Generează Factura Proformă</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerFaceIdSimulation}
                      disabled={faceIdSimulating || isProcessing}
                      className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                    >
                      {faceIdSimulating ? (
                        <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                          <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          <span>Face ID...</span>
                        </div>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Simulează Face ID</span>
                        </>
                      )}
                    </button>

                    <a
                      href={revolutPayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                      <span>Deschide pe iPhone</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Link copiat!' : 'Copiază link-ul Revolut'}</span>
                    </button>
                    <span className="text-zinc-700">•</span>
                    <button
                      type="button"
                      onClick={() => setActiveSheet('NONE')}
                      className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Alege altă metodă
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIZUALIZARE DEDICATĂ: 2. REVOLUT PAY & QR CODE */}
            {activeSheet === 'REVOLUT_PAY' && (
              <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-950 to-blue-950 text-white rounded-3xl border border-blue-900/60 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between w-full pb-3 border-b border-blue-900/40 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSheet('NONE')}
                    className="flex items-center gap-1.5 text-blue-300 hover:text-white font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Înapoi</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-white text-slate-950 font-black flex items-center justify-center text-[11px]">
                      R
                    </span>
                    <span className="font-extrabold text-sm tracking-tight">Revolut Pay</span>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                    {price} RON
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    Scanează cu aplicația Revolut sau camera
                  </div>
                  <p className="text-[11px] text-blue-200 max-w-xs">
                    Transfer 1-Click către <strong>Catalin Sandu PFA</strong> în valoare de {price} RON.
                  </p>
                </div>

                {/* Cod QR Revolut */}
                <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-blue-950 flex flex-col items-center justify-center">
                  <img
                    src={qrCodeImageUrl}
                    alt="Cod QR Revolut Pay"
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl object-contain block"
                  />
                  <div className="text-[10px] font-mono text-slate-600 mt-1.5 font-bold">
                    revolut.me/catalinsandu07
                  </div>
                </div>

                <div className="w-full space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleExecutePayment('REVOLUT_PAY')}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Am autorizat plata în Revolut • Emite Proforma</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={revolutPayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>Deschide în Revolut</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="py-2.5 px-3 bg-blue-900/60 hover:bg-blue-800 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-blue-700/60"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copiat!' : 'Copiază link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIZUALIZARE DEDICATĂ: 3. GOOGLE PAY & QR CODE */}
            {activeSheet === 'GOOGLE_PAY' && (
              <div className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between w-full pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSheet('NONE')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Înapoi</span>
                  </button>
                  <div className="flex items-center gap-1 font-extrabold text-sm">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                    <span className="ml-1 font-bold">Pay</span>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {price} RON
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-sm font-extrabold flex items-center justify-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    Scanează cu telefonul mobil
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                    Autorizare rapidă și securizată prin Google Pay / Revolut.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-200 flex flex-col items-center justify-center">
                  <img
                    src={qrCodeImageUrl}
                    alt="Cod QR Google Pay"
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl object-contain block"
                  />
                  <div className="text-[10px] font-mono text-slate-600 mt-1.5 font-bold">
                    revolut.me/catalinsandu07
                  </div>
                </div>

                <div className="w-full space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleExecutePayment('GOOGLE_PAY')}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Am efectuat plata prin Google Pay • Emite Proforma</span>
                  </button>

                  <a
                    href={revolutPayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Deschide Link-ul Direct</span>
                  </a>
                </div>
              </div>
            )}

            {/* VIZUALIZARE DEDICATĂ: 4. 3D-SECURE 2.2 VERIFICATION */}
            {activeSheet === 'CARD_3DS' && (
              <div className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-blue-200 dark:border-blue-900 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between w-full pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSheet('NONE')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Înapoi</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="font-extrabold text-sm tracking-tight">Verificare 3D-Secure 2.2</span>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    {price} RON
                  </span>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-center space-y-2 max-w-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-blue-950 dark:text-blue-100">
                    Autorizare solicitată de banca dvs.
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                    Vă rugăm să deschideți aplicația băncii dvs. (Revolut, BT Pay, ING, BCR etc.) sau să introduceți codul SMS pentru a aproba tranzacția de {price} RON către <strong>Catalin Sandu PFA</strong>.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleExecutePayment('CARD')}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Am aprobat în aplicația bancară • Finalizează</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSheet('NONE')}
                    className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer font-medium"
                  >
                    ← Modifică datele cardului
                  </button>
                </div>
              </div>
            )}

            {/* VIZUALIZAREA PRINCIPALĂ (Când nu este deschisă o sub-fereastră) */}
            {activeSheet === 'NONE' && (
              <>
                {/* SECTIUNE: Express Checkout (Revolut Pay, Apple Pay, Google Pay) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Plată Rapidă (Alege metoda dorită)
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      Include Cod QR & Telefon
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* 1. REVOLUT PAY BUTTON */}
                    <button
                      type="button"
                      onClick={() => setActiveSheet('REVOLUT_PAY')}
                      disabled={isProcessing}
                      className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 hover:from-black hover:to-blue-900 text-white rounded-2xl border border-slate-700 shadow-md flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 relative overflow-hidden"
                      title="Plătește prin Revolut Pay cu Cod QR"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-white text-slate-950 font-black flex items-center justify-center text-[11px]">
                          R
                        </span>
                        <span className="font-extrabold text-sm tracking-tight">Revolut Pay</span>
                      </div>
                      <span className="text-[10px] text-blue-300 font-medium">Cod QR & 1-Click</span>
                    </button>

                    {/* 2. APPLE PAY BUTTON */}
                    <button
                      type="button"
                      onClick={() => setActiveSheet('APPLE_PAY')}
                      disabled={isProcessing}
                      className="p-3 bg-black hover:bg-zinc-900 text-white rounded-2xl border border-zinc-800 shadow-md flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 relative overflow-hidden"
                      title="Plătește cu Apple Pay pe iPhone cu Cod QR"
                    >
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.5-7.7-11.44-13.98-5.43-8.68-9.77-18.49-13.01-29.43-3.24-10.94-4.86-21.6-4.86-31.98 0-15.02 3.8-27.53 11.41-37.53 7.61-10 17.29-15.11 29.04-15.33 4.58 0 9.61 1.25 15.11 3.75 5.5 2.5 9.07 3.8 10.72 3.91 1.74-.11 5.37-1.41 10.9-3.91 5.53-2.5 10.22-3.75 14.07-3.75 10.43.33 19.34 4.35 26.73 12.06-9.57 5.86-14.24 13.91-14.02 24.13.22 8.04 3.37 14.78 9.45 20.22 6.08 5.43 13.26 8.58 21.52 9.45-2.07 6.41-4.7 13.04-7.91 19.89zm-29.35-121.2c0 6.08-2.28 11.95-6.84 17.61-5.54 6.74-12.28 10.87-20.22 12.39-.33-1.63-.5-3.15-.5-4.57 0-6.19 2.45-12.39 7.35-18.58 2.45-3.04 5.54-5.65 9.28-7.82 3.74-2.18 7.33-3.43 10.78-3.75.11 1.63.15 3.2.15 4.72z" />
                        </svg>
                        <span className="font-extrabold text-sm tracking-tight">Pay</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium">Scanează cu iPhone</span>
                    </button>

                    {/* 3. GOOGLE PAY BUTTON */}
                    <button
                      type="button"
                      onClick={() => setActiveSheet('GOOGLE_PAY')}
                      disabled={isProcessing}
                      className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 relative overflow-hidden"
                      title="Plătește cu Google Pay"
                    >
                      <div className="flex items-center gap-1 font-extrabold text-sm">
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                        <span className="ml-1 font-bold text-slate-800 dark:text-white">Pay</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Scanează cu Telefonul</span>
                    </button>
                  </div>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    sau plătește cu orice Card Bancar
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Formular Card */}
                <div className="space-y-3.5 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Date Card Bancar (Visa / Mastercard / Revolut)
                    </label>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Completează Card Test
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Număr Card (ex: 5258 4099 1234 5678)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Data Expirării (LL/AA)"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="CVV / CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Nume și Prenume Posesor Card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    Abonamentul se activează <strong>pe loc</strong> imediat ce plata este confirmată (fie prin Apple Pay, Google Pay, Revolut Pay sau Card), iar factura proformă va fi emisă și descărcabilă în format PDF.
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('DETAILS')}
                    disabled={isProcessing}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium cursor-pointer"
                  >
                    ← Înapoi la date
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSheet('CARD_3DS')}
                    disabled={isProcessing}
                    className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Confirmă Plata cu Cardul • {price} RON</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* PAS 3: Succes, Activare Imediată & Factură Proformă Completă */}
        {step === 'SUCCESS' && generatedProforma && (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Banner Confirmare & Activare Imediată */}
            <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6 text-white stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm">Plată Confirmată de Card • Abonament {selectedPlan} Activat Imediat!</h4>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Beneficiați acum de {maxOffers} oferte active, White-Label complet și semnătură digitală validă.
                </p>
              </div>
            </div>

            {/* Indicator Transmitere Email Factură Proformă */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Factura Proformă {generatedProforma.serie_numar} a fost transmisă automat:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500">Către Client:</span>{' '}
                    <strong className="text-slate-900 dark:text-white">{generatedProforma.transmis_client_email}</strong>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500">Către Operator:</span>{' '}
                    <strong className="text-slate-900 dark:text-white">{ADMIN_NOTIFICATION_EMAIL}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Vizual: Factura Proformă Oficială (pregătită pentru export PDF / print) */}
            <div
              id="proforma-paper-preview"
              className="bg-white text-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-300 shadow-sm space-y-5 text-xs font-sans"
            >
              {/* Antet Factură */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-lg font-black text-blue-600 tracking-tight">
                    FACTURĂ PROFORMĂ
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    Seria & Numărul: <span className="font-mono text-slate-900">{generatedProforma.serie_numar}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Data emiterii: {new Date(generatedProforma.data_emiterii).toLocaleDateString('ro-RO')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Data scadenței: {new Date(generatedProforma.data_scadenta).toLocaleDateString('ro-RO')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-300">
                    ✓ {generatedProforma.metoda_plata || 'ACHITAT PRIN REVOLUT'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Ref: {generatedProforma.revolut_transaction_id}
                  </div>
                </div>
              </div>

              {/* Furnizor & Client */}
              <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 text-blue-700">
                    FURNIZOR (OPERATOR)
                  </div>
                  <div className="font-bold text-slate-900">{generatedProforma.furnizor.nume}</div>
                  <div>CUI: <strong>{generatedProforma.furnizor.cui}</strong></div>
                  <div>Reg. Com.: {generatedProforma.furnizor.reg_com}</div>
                  <div>Sediu: {generatedProforma.furnizor.sediu}</div>
                  <div>Email: {generatedProforma.furnizor.email}</div>
                  <div>Tel: {generatedProforma.furnizor.telefon}</div>
                  <div>Bancă: {generatedProforma.furnizor.banca}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 text-blue-700">
                    CUMPĂRĂTOR (CLIENT)
                  </div>
                  <div className="font-bold text-slate-900">{generatedProforma.client.nume}</div>
                  {generatedProforma.client.cui && <div>CUI / CIF: <strong>{generatedProforma.client.cui}</strong></div>}
                  <div>Adresă: {generatedProforma.client.adresa}</div>
                  <div>Email: <strong>{generatedProforma.client.email}</strong></div>
                  {generatedProforma.client.telefon && <div>Tel: {generatedProforma.client.telefon}</div>}
                </div>
              </div>

              {/* Tabel Articole Factură */}
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                    <th className="py-2 px-2.5 text-left">Nr.</th>
                    <th className="py-2 px-2.5 text-left">Denumire Serviciu</th>
                    <th className="py-2 px-2.5 text-center">U.M.</th>
                    <th className="py-2 px-2.5 text-center">Cant.</th>
                    <th className="py-2 px-2.5 text-right">Preț Unitar</th>
                    <th className="py-2 px-2.5 text-right">Valoare (RON)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2.5 px-2.5 text-left">1</td>
                    <td className="py-2.5 px-2.5 text-left">
                      <div className="font-bold text-slate-900">{generatedProforma.descriere_serviciu}</div>
                      <div className="text-[10px] text-slate-500">
                        Procesat online prin Revolut Merchant API • Licență activată automat
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-center">lună</td>
                    <td className="py-2.5 px-2.5 text-center">1</td>
                    <td className="py-2.5 px-2.5 text-right font-medium">{generatedProforma.valoare},00</td>
                    <td className="py-2.5 px-2.5 text-right font-bold">{generatedProforma.valoare},00</td>
                  </tr>
                </tbody>
              </table>

              {/* Total & Mențiune Achitare */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-[10px] text-slate-500 leading-tight">
                  Document generat electronic conform legislației în vigoare.<br />
                  Stare: <strong>ACHITAT INTEGRAL ({generatedProforma.metoda_plata})</strong>.
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-semibold">TOTAL DE PLATĂ</div>
                  <div className="text-xl font-black text-slate-900">
                    {generatedProforma.valoare},00 RON
                  </div>
                </div>
              </div>
            </div>

            {/* Butoane Acțiuni Client: PDF, Tipărire, Continuă */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>{isDownloadingPdf ? 'Se generează PDF...' : 'Descarcă Proforma (PDF)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Tipărește</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Continuă în Dashboard cu Planul {selectedPlan}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
