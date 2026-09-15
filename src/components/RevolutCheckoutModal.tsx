import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Check,
  ShieldCheck,
  Download,
  Lock,
  ExternalLink,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Organization, SubscriptionPlan, ProformaInvoice } from '../types.ts';
import {
  createAndRecordProforma,
  exportProformaToPdf,
  OPERATOR_PROVIDER_INFO,
} from '../lib/proforma.ts';

interface RevolutCheckoutModalProps {
  organization: Organization;
  currentPlan: SubscriptionPlan;
  initialSelectedPlan?: SubscriptionPlan;
  onClose: () => void;
  onSuccessUpgrade: (plan: SubscriptionPlan) => void;
}

// Logo-uri vectoriale Revolut & Carduri
const VisaLogo = () => (
  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-[#00579f] text-white font-black italic text-[9px] tracking-tighter leading-none select-none">
    VISA
  </span>
);

const MastercardLogo = () => (
  <span className="inline-flex items-center justify-center select-none">
    <span className="w-3 h-3 rounded-full bg-[#eb001b] -mr-1 inline-block"></span>
    <span className="w-3 h-3 rounded-full bg-[#f79e1b] inline-block opacity-90"></span>
  </span>
);

const AppleLogo = () => (
  <svg className="w-4 h-4 fill-current inline-block -mt-0.5" viewBox="0 0 170 170">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.77-11.97-14.19-6.3-9.57-11.13-20.44-14.49-32.61-3.36-12.16-5.04-23.75-5.04-34.76 0-14.77 3.73-27.18 11.19-37.23 7.46-10.05 17.06-15.19 28.8-15.42 5.01 0 10.45 1.25 16.32 3.76 5.87 2.5 9.77 3.82 11.71 3.93 1.94-.11 5.92-1.48 11.93-4.13 6.01-2.65 11.37-3.86 16.08-3.64 12.38.65 22.4 4.99 30.07 13.02-10.86 6.53-16.19 15.54-16 27.02.21 9.35 3.85 17.29 10.92 23.82 7.07 6.53 15.65 10.15 25.74 10.86-2.17 6.74-4.78 13.7-7.83 20.88zM119.22 31.95c0-7.39 2.66-14.3 7.98-20.73 5.32-6.43 11.83-10.55 19.53-12.36.43 1.09.65 2.28.65 3.59 0 7.39-2.77 14.45-8.31 21.18-5.54 6.73-12.16 10.76-19.85 12.09v-3.77z" />
  </svg>
);

const GoogleGLogo = () => (
  <svg className="w-4 h-4 inline-block -mt-0.5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const RevolutCheckoutModal: React.FC<RevolutCheckoutModalProps> = ({
  organization,
  currentPlan,
  initialSelectedPlan = 'STARTER',
  onClose,
  onSuccessUpgrade,
}) => {
  // Etape: 
  // 1. BILLING: Date de facturare & confirmare sumă (45 RON sau 100 RON)
  // 2. REVOLUT_CHECKOUT: Ecranul Revolut Business cu metodele de plată
  // 3. AWAITING_PAYMENT: Așteptare finalizare plată pe pagina oficială Revolut
  // 4. SUCCESS: Factură fiscală generată & descărcabilă în PDF
  const [step, setStep] = useState<'BILLING' | 'REVOLUT_CHECKOUT' | 'AWAITING_PAYMENT' | 'SUCCESS'>('BILLING');

  // Prețuri corecte din OfferFlow:
  // STARTER: 45 lei | CLASIC: 100 lei
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    initialSelectedPlan === 'CLASIC' ? 'CLASIC' : 'STARTER'
  );
  const [amount, setAmount] = useState<number>(
    initialSelectedPlan === 'CLASIC' ? 100 : 45
  );

  // Date facturare
  const [tipPersoana, setTipPersoana] = useState<'PJ' | 'PF'>('PJ');
  const [denumire, setDenumire] = useState(
    organization?.nume || 'SANDU M.I. CĂTĂLIN PERSOANĂ FIZICĂ AUTORIZATĂ'
  );
  const [cui, setCui] = useState(organization?.cui || '54552543');
  const [email, setEmail] = useState('catalinsandu@protonmail.com');
  const [telefon, setTelefon] = useState('+40765263860');
  const [adresa, setAdresa] = useState('Craiova, Dolj, Romania');

  // Stare comunicare Revolut API
  const [isOpeningPayment, setIsOpeningPayment] = useState(false);
  const [activeCheckoutUrl, setActiveCheckoutUrl] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [selectedMethodName, setSelectedMethodName] = useState<string>('Revolut Checkout');

  // Factură finală
  const [generatedInvoice, setGeneratedInvoice] = useState<ProformaInvoice | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Actualizare sumă când se schimbă planul
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setAmount(plan === 'CLASIC' ? 100 : 45);
  };

  // Trimitere din pasul 1 la ecranul de selecție metode Revolut
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('REVOLUT_CHECKOUT');
  };

  // Deschidere plată reală prin Revolut
  const handleOpenRevolutPayment = async (methodName: string) => {
    setIsOpeningPayment(true);
    setSelectedMethodName(methodName);

    // Deschidem fereastra sincron pentru a nu fi blocată de browser popup blocker
    const payWindow = window.open('about:blank', '_blank');

    try {
      const res = await fetch('/api/create-revolut-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          customAmount: amount,
          email,
          clientName: denumire,
          organizationId: organization?.id,
          returnUrl: window.location.origin,
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        setActiveCheckoutUrl(data.url);
        setActiveOrderId(data.orderId || '');
        if (payWindow) {
          payWindow.location.href = data.url;
        } else {
          window.open(data.url, '_blank');
        }
        setStep('AWAITING_PAYMENT');
      } else {
        if (payWindow) payWindow.close();
        // Fallback dacă nu s-a generat url
        const fallbackUrl = selectedPlan === 'CLASIC'
          ? 'https://checkout.revolut.com/payment-link/66c35f26-fed9-4dff-a4ab-edc5e4cb900f'
          : 'https://checkout.revolut.com/payment-link/7bb72a48-6627-4f55-be6b-9c3327717dca';
        setActiveCheckoutUrl(fallbackUrl);
        window.open(fallbackUrl, '_blank');
        setStep('AWAITING_PAYMENT');
      }
    } catch (err) {
      console.error('Eroare creare plată Revolut:', err);
      if (payWindow) payWindow.close();
      const fallbackUrl = selectedPlan === 'CLASIC'
        ? 'https://checkout.revolut.com/payment-link/66c35f26-fed9-4dff-a4ab-edc5e4cb900f'
        : 'https://checkout.revolut.com/payment-link/7bb72a48-6627-4f55-be6b-9c3327717dca';
      setActiveCheckoutUrl(fallbackUrl);
      window.open(fallbackUrl, '_blank');
      setStep('AWAITING_PAYMENT');
    } finally {
      setIsOpeningPayment(false);
    }
  };

  // Verificare automată status comandă Revolut prin polling
  useEffect(() => {
    if (step !== 'AWAITING_PAYMENT' || !activeOrderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/revolut-order-status/${activeOrderId}`);
        const data = await res.json();
        if (data.isPaid) {
          handleConfirmPaymentSuccess();
        }
      } catch (e) {
        // ignorare erori temporare
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [step, activeOrderId]);

  // Confirmare finală a plății și emitere factură
  const handleConfirmPaymentSuccess = () => {
    const invoice = createAndRecordProforma({
      plan: selectedPlan,
      customAmount: amount,
      clientName: denumire,
      clientCui: cui,
      clientAddress: adresa,
      clientEmail: email,
      clientPhone: telefon,
      metodaPlata: `Revolut Business (${selectedMethodName})`,
      revolutOrderId: activeOrderId || undefined,
    });

    setGeneratedInvoice(invoice);
    setStep('SUCCESS');
    onSuccessUpgrade(selectedPlan);
  };

  const handleDownloadPdf = async () => {
    if (!generatedInvoice) return;
    setIsDownloadingPdf(true);
    try {
      await exportProformaToPdf(generatedInvoice);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">

        {/* ======================================================== */}
        {/* PASUL 1: DATE DE FACTURARE & SELECTOR PLANURI OFFERFLOW  */}
        {/* ======================================================== */}
        {step === 'BILLING' && (
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                  Pasul 1 din 2
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Date Facturare &amp; Comandă
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector Pachete OfferFlow: 45 RON Starter | 100 RON Clasic */}
            <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Alege Pachetul OfferFlow
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectPlan('STARTER')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPlan === 'STARTER'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">Plan Starter</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      Popular
                    </span>
                  </div>
                  <div className="text-lg font-black mt-1 text-slate-900">45 lei</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">/ lună • 5 oferte active</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPlan('CLASIC')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPlan === 'CLASIC'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">Plan Clasic</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      B2B
                    </span>
                  </div>
                  <div className="text-lg font-black mt-1 text-slate-900">100 lei</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">/ lună • 30 oferte active</div>
                </button>
              </div>
            </div>

            {/* Formular date de facturare */}
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="tip_persoana"
                    checked={tipPersoana === 'PJ'}
                    onChange={() => setTipPersoana('PJ')}
                    className="accent-blue-600"
                  />
                  <span>Persoană Juridică (Firmă / PFA)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="tip_persoana"
                    checked={tipPersoana === 'PF'}
                    onChange={() => setTipPersoana('PF')}
                    className="accent-blue-600"
                  />
                  <span>Persoană Fizică</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {tipPersoana === 'PJ' ? 'Denumire Companie / PFA' : 'Nume & Prenume'}
                </label>
                <input
                  type="text"
                  required
                  value={denumire}
                  onChange={(e) => setDenumire(e.target.value)}
                  placeholder="ex: SANDU M.I. CĂTĂLIN PERSOANĂ FIZICĂ AUTORIZATĂ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tipPersoana === 'PJ' ? 'CUI / CIF' : 'CNP'}
                  </label>
                  <input
                    type="text"
                    required
                    value={cui}
                    onChange={(e) => setCui(e.target.value)}
                    placeholder="ex: 54552543"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Număr Telefon
                  </label>
                  <input
                    type="tel"
                    required
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    placeholder="ex: +40765263860"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email pentru Factură &amp; Chitanță
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="catalinsandu@protonmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sediu / Adresă Facturare
                  </label>
                  <input
                    type="text"
                    required
                    value={adresa}
                    onChange={(e) => setAdresa(e.target.value)}
                    placeholder="Craiova, Dolj, Romania"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 bg-black hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continuă spre plată (Plătește {amount} lei)</span>
                  <span className="font-mono text-xs opacity-75">→</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tranzacție securizată SSL • Procesat prin Revolut Business</span>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASUL 2: ECRANUL REVOLUT BUSINESS (IDENTIC CU CAPTURA)     */}
        {/* ======================================================== */}
        {step === 'REVOLUT_CHECKOUT' && (
          <div className="bg-[#f7f7f8] text-slate-900 min-h-[560px] p-6 sm:p-10 flex flex-col justify-between select-none">
            {/* Navigare înapoi */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setStep('BILLING')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Înapoi la date facturare</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Antet Revolut Business */}
            <div className="pt-2 pb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Plătește {amount} lei
              </h1>
              <p className="text-sm font-semibold text-slate-700 mt-2 tracking-wide uppercase">
                Către {OPERATOR_PROVIDER_INFO.nume}
              </p>
            </div>

            {isOpeningPayment ? (
              <div className="my-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-3">
                <Loader2 className="w-8 h-8 text-black animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-900">Se deschide conexiunea securizată Revolut Checkout...</p>
                <p className="text-xs text-slate-500">
                  Vă rugăm să așteptați câteva secunde.
                </p>
              </div>
            ) : (
              /* Metode de plată oficiale */
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">
                  Alege o metodă de plată
                </h2>

                {/* 1. Revolut Pay */}
                <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-950">
                        Revolut Pay
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Câștigă 2x Puncte Revolut.{' '}
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          Află mai multe
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <VisaLogo />
                        <MastercardLogo />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenRevolutPayment('Revolut Pay')}
                      className="px-6 py-2.5 bg-black hover:bg-slate-800 active:scale-95 text-white font-black text-sm rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0 tracking-tight"
                    >
                      <span>Revolut</span>
                      <span className="font-normal ml-1">Pay</span>
                    </button>
                  </div>
                </div>

                {/* 2. Container Card bancar + Apple Pay + Google Pay */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                  {/* Card debit / credit */}
                  <div className="p-5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-950">
                        Card de debit sau de credit
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <VisaLogo />
                        <MastercardLogo />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenRevolutPayment('Card de debit/credit')}
                      className="px-5 py-2.5 bg-[#f0f0f2] hover:bg-[#e4e4e7] active:scale-95 text-slate-800 font-bold text-xs rounded-full transition-all cursor-pointer shrink-0"
                    >
                      Plătește cu car...
                    </button>
                  </div>

                  {/* Apple Pay - Deschide pagina Revolut cu Apple Pay activ pe iOS/Mac */}
                  <div className="p-5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-950">
                        Apple Pay
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Plată biometrică instantanee cu Apple Wallet
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenRevolutPayment('Apple Pay')}
                      className="px-7 py-2.5 bg-black hover:bg-slate-800 active:scale-95 text-white font-bold text-sm rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <AppleLogo />
                      <span>Pay</span>
                    </button>
                  </div>

                  {/* Google Pay */}
                  <div className="p-5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-950">
                        Google Pay
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Plată rapidă securizată prin Google Account
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenRevolutPayment('Google Pay')}
                      className="px-7 py-2.5 bg-black hover:bg-slate-800 active:scale-95 text-white font-bold text-sm rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <GoogleGLogo />
                      <span>Pay</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subsol oficial comerciant */}
            <div className="pt-10 pb-2 text-center text-xs text-slate-500 space-y-3">
              <div>
                <p className="font-medium">{OPERATOR_PROVIDER_INFO.email}</p>
                <p className="text-slate-400 mt-0.5">
                  {OPERATOR_PROVIDER_INFO.telefon} • {OPERATOR_PROVIDER_INFO.sediu}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-slate-400">Cu sprijinul</p>
                <div className="font-black text-sm tracking-tight text-slate-900 mt-0.5">
                  Revolut <span className="font-medium text-slate-700">Business</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                <p>Copyright © 2026 Revolut Limited</p>
                <p className="mt-0.5">
                  Vezi{' '}
                  <span className="text-blue-600 hover:underline cursor-pointer">
                    Politica privind confidențialitatea
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASUL 2.5: AȘTEPTARE FINALIZARE PE REVOLUT (REAL CHECKOUT) */}
        {/* ======================================================== */}
        {step === 'AWAITING_PAYMENT' && (
          <div className="p-6 sm:p-8 text-center space-y-6 bg-white">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 shadow-xs">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                Fereastra Revolut Checkout Deschisă
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Plătește {amount} lei prin {selectedMethodName}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Pagina securizată Revolut a fost deschisă în browserul dvs. 
                Finalizați autorizarea prin <strong>{selectedMethodName}</strong> pentru activarea abonamentului <strong>OfferFlow {selectedPlan}</strong>.
              </p>
            </div>

            {/* Panou Detalii & Link redeschidere */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Beneficiar:</span>
                <span className="font-bold text-slate-900">{OPERATOR_PROVIDER_INFO.nume}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Pachet selectat:</span>
                <span className="font-bold text-blue-600">{selectedPlan} (30 de zile)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total de achitat:</span>
                <span className="font-black text-slate-900 text-sm">{amount} RON</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Nu s-a deschis fereastra?</span>
                {activeCheckoutUrl && (
                  <a
                    href={activeCheckoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Deschide Revolut Checkout</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Butoane acțiune */}
            <div className="space-y-3 max-w-md mx-auto pt-2">
              <button
                type="button"
                onClick={handleConfirmPaymentSuccess}
                className="w-full py-3.5 px-5 bg-black hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Am finalizat plata în Revolut (Activează Planul)</span>
              </button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('REVOLUT_CHECKOUT')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Alege altă metodă
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span>Se verifică statusul plății...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASUL 3: SUCCES & DESCĂRCARE FACTURĂ FISCALĂ (PDF)        */}
        {/* ======================================================== */}
        {step === 'SUCCESS' && (
          <div className="p-8 sm:p-10 text-center space-y-5 bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Plată Autorizată cu Succes
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Abonamentul OfferFlow {selectedPlan} este Activ!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Tranzacția de <strong>{amount} RON</strong> a fost confirmată către{' '}
                <strong>{OPERATOR_PROVIDER_INFO.nume}</strong>.
              </p>
            </div>

            {/* Rezumat Factură Fiscală / Proformă */}
            {generatedInvoice && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>Factură Fiscală / Proformă:</span>
                  <span className="font-mono text-blue-600">{generatedInvoice.serie_numar}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cumpărător:</span>
                  <span className="font-semibold text-slate-800">{generatedInvoice.client.nume}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CUI/CNP:</span>
                  <span className="font-mono">{generatedInvoice.client.cui || 'Persoană Fizică'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Încasat:</span>
                  <span className="font-black text-emerald-700">{amount} RON</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Procesator:</span>
                  <span className="font-bold text-slate-800">Revolut Business (Merchant)</span>
                </div>
              </div>
            )}

            {/* Butoane Acțiune Finală */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Descarcă Factura (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Mergi la Panou de Control
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
