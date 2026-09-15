import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Check,
  CheckCircle2,
  ShieldCheck,
  Download,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  QrCode,
  Smartphone,
  CreditCard,
  Loader2,
  Sparkles,
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

// Logo-uri vectoriale curate
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
  // Pasul 1: Date facturare | Pasul 2: Ecranul Revolut Business (attach) | Pasul 3: Succes & Factură
  const [step, setStep] = useState<'BILLING' | 'REVOLUT_CHECKOUT' | 'SUCCESS'>('BILLING');

  // Sumă plată: 500 lei (identic cu captura) sau suma planului
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'CLASIC' | 'CUSTOM'>(
    initialSelectedPlan === 'CLASIC' ? 'CLASIC' : 'STARTER'
  );
  const [amount, setAmount] = useState<number>(500); // 500 lei ca în attach

  // Date de facturare (precompletate inteligent cu datele firmei / PFA)
  const [tipPersoana, setTipPersoana] = useState<'PJ' | 'PF'>('PJ');
  const [denumire, setDenumire] = useState(
    organization?.nume || 'SANDU M.I. CĂTĂLIN PERSOANĂ FIZICĂ AUTORIZATĂ'
  );
  const [cui, setCui] = useState(organization?.cui || '54552543');
  const [email, setEmail] = useState('catalinsandu@protonmail.com');
  const [telefon, setTelefon] = useState('+40765263860');
  const [adresa, setAdresa] = useState('Craiova, Dolj, Romania');

  // Stări pentru sub-metodele de plată din ecranul Revolut
  const [activePaymentMethod, setActivePaymentMethod] = useState<
    'NONE' | 'REVOLUT_PAY' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY'
  >('NONE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState<ProformaInvoice | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Câmpuri plată cu cardul inline
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(denumire);

  // Număr telefon pentru Revolut Pay
  const [revolutPhone, setRevolutPhone] = useState(telefon);

  // Trecere de la date facturare la ecranul de plată
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('REVOLUT_CHECKOUT');
  };

  // Executare autorizare plată cu animație autentică Revolut
  const executePayment = async (methodName: string) => {
    setIsProcessing(true);
    setProcessingText(`Se autorizează plata de ${amount} lei prin ${methodName}...`);

    setTimeout(() => {
      // 1. Generare proformă / factură fiscală
      const targetPlan: SubscriptionPlan = selectedPlan === 'CLASIC' ? 'CLASIC' : 'STARTER';
      const invoice = createAndRecordProforma({
        plan: targetPlan,
        customAmount: amount,
        clientName: denumire,
        clientCui: cui,
        clientAddress: adresa,
        clientEmail: email,
        clientPhone: telefon,
        metodaPlata: methodName,
      });

      setGeneratedInvoice(invoice);
      setIsProcessing(false);
      setStep('SUCCESS');
      onSuccessUpgrade(targetPlan);
    }, 1800);
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
        {/* PASUL 1: DATE DE FACTURARE SIMPLIFICATE                   */}
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

            {/* Selector Sumă / Pachet */}
            <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pachet selectat &amp; Valoare de plată
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('STARTER');
                    setAmount(199);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedPlan === 'STARTER' && amount === 199
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">STARTER</div>
                  <div className="text-sm font-black mt-0.5">199 lei</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('CUSTOM');
                    setAmount(500);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    amount === 500
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-center gap-1">
                    <span>Ofertă / Demo</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>
                  <div className="text-sm font-black mt-0.5 text-slate-900">500 lei</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('CLASIC');
                    setAmount(499);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedPlan === 'CLASIC' && amount === 499
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">CLASIC B2B</div>
                  <div className="text-sm font-black mt-0.5">499 lei</div>
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
                    placeholder="ex: 54552543 sau RO..."
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
        {/* PASUL 2: FEREASTRA EXACTĂ DIN ATTACH (REVOLUT BUSINESS)   */}
        {/* ======================================================== */}
        {step === 'REVOLUT_CHECKOUT' && (
          <div className="bg-[#f7f7f8] text-slate-900 min-h-[560px] p-6 sm:p-10 flex flex-col justify-between select-none">
            {/* Buton navigare înapoi */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => {
                  setActivePaymentMethod('NONE');
                  setStep('BILLING');
                }}
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

            {/* Antet identic cu captura din attach */}
            <div className="pt-2 pb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Plătește {amount} lei
              </h1>
              <p className="text-sm font-semibold text-slate-700 mt-2 tracking-wide uppercase">
                Către {OPERATOR_PROVIDER_INFO.nume}
              </p>
            </div>

            {/* Animație de procesare tranzacție dacă este activă */}
            {isProcessing && (
              <div className="my-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <Loader2 className="w-8 h-8 text-black animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-900">{processingText}</p>
                <p className="text-xs text-slate-500">
                  Vă rugăm să nu închideți această fereastră în timpul autorizării...
                </p>
              </div>
            )}

            {/* Secțiunea de Metode de Plată (Exact ca în screenshot) */}
            {!isProcessing && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">
                  Alege o metodă de plată
                </h2>

                {/* 1. Cardul Revolut Pay */}
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
                      onClick={() => {
                        if (activePaymentMethod === 'REVOLUT_PAY') {
                          executePayment('Revolut Pay');
                        } else {
                          setActivePaymentMethod('REVOLUT_PAY');
                        }
                      }}
                      className="px-6 py-2.5 bg-black hover:bg-slate-800 active:scale-95 text-white font-black text-sm rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0 tracking-tight"
                    >
                      <span>Revolut</span>
                      <span className="font-normal ml-1">Pay</span>
                    </button>
                  </div>

                  {/* Detalii extinse Revolut Pay la clic */}
                  {activePaymentMethod === 'REVOLUT_PAY' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                        <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-slate-900 mb-0.5">
                            Autorizare plată din aplicația Revolut
                          </span>
                          Număr telefon asociat contului: <strong>{revolutPhone}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="tel"
                          value={revolutPhone}
                          onChange={(e) => setRevolutPhone(e.target.value)}
                          placeholder="+40 765 263 860"
                          className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => executePayment('Revolut Pay')}
                          className="px-4 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shrink-0 transition-colors cursor-pointer"
                        >
                          Confirmă în Revolut ({amount} lei)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Containerul Card de debit/credit + Apple Pay + Google Pay */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                  {/* Rândul 1: Card de debit sau de credit */}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
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
                        onClick={() =>
                          setActivePaymentMethod(
                            activePaymentMethod === 'CARD' ? 'NONE' : 'CARD'
                          )
                        }
                        className="px-5 py-2.5 bg-[#f0f0f2] hover:bg-[#e4e4e7] active:scale-95 text-slate-800 font-bold text-xs rounded-full transition-all cursor-pointer shrink-0"
                      >
                        {activePaymentMethod === 'CARD'
                          ? 'Ascunde formular'
                          : 'Plătește cu car...'}
                      </button>
                    </div>

                    {/* Formular Card inline când se apasă pe buton */}
                    {activePaymentMethod === 'CARD' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                            Număr Card
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                const v = e.target.value
                                  .replace(/\D/g, '')
                                  .replace(/(.{4})/g, '$1 ')
                                  .trim();
                                setCardNumber(v);
                              }}
                              placeholder="4532 •••• •••• 8920"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-black outline-none"
                            />
                            <div className="absolute right-3 top-2.5 flex items-center gap-1">
                              <VisaLogo />
                              <MastercardLogo />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                              Valabilitate (LL/AA)
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                setCardExpiry(v);
                              }}
                              placeholder="12/28"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-center focus:bg-white focus:ring-2 focus:ring-black outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                              Cod CVC / CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                              placeholder="•••"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-center focus:bg-white focus:ring-2 focus:ring-black outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => executePayment('Card Bancar Securizat')}
                          className="w-full py-3 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Plătește {amount} lei</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rândul 2: Apple Pay */}
                  <div className="p-5 flex items-center justify-between gap-3">
                    <div className="text-base font-bold text-slate-950">
                      Apple Pay
                    </div>
                    <button
                      type="button"
                      onClick={() => executePayment('Apple Pay')}
                      className="px-7 py-2.5 bg-black hover:bg-slate-800 active:scale-95 text-white font-bold text-sm rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <AppleLogo />
                      <span>Pay</span>
                    </button>
                  </div>

                  {/* Rândul 3: Google Pay */}
                  <div className="p-5 flex items-center justify-between gap-3">
                    <div className="text-base font-bold text-slate-950">
                      Google Pay
                    </div>
                    <button
                      type="button"
                      onClick={() => executePayment('Google Pay')}
                      className="px-7 py-2.5 bg-black hover:bg-slate-800 active:scale-95 text-white font-bold text-sm rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <GoogleGLogo />
                      <span>Pay</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subsol identic 1:1 cu captura din attach */}
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
        {/* PASUL 3: CONFIRMARE REUȘITĂ & DESCĂRCARE FACTURĂ          */}
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
                Plata de {amount} lei a fost confirmată!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Tranzacția a fost procesată cu succes către{' '}
                <strong>{OPERATOR_PROVIDER_INFO.nume}</strong>. Abonamentul dvs. este acum activat.
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
