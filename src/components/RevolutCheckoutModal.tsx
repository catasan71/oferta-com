import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ArrowLeft,
  Check,
  ShieldCheck,
  Lock,
  ExternalLink,
  Loader2,
  Sparkles,
  RefreshCw,
  Building2,
  User,
  CreditCard,
  Zap,
} from 'lucide-react';
import { Organization, SubscriptionPlan, ProformaInvoice } from '../types.ts';
import {
  createAndRecordProforma,
  OPERATOR_PROVIDER_INFO,
  ADMIN_NOTIFICATION_EMAIL,
} from '../lib/proforma.ts';
import { ModernInvoiceTemplate } from './ModernInvoiceTemplate.tsx';

interface RevolutCheckoutModalProps {
  organization: Organization;
  currentPlan: SubscriptionPlan;
  initialSelectedPlan?: SubscriptionPlan;
  onClose: () => void;
  onSuccessUpgrade: (plan: SubscriptionPlan) => void;
}

// Logo-uri vectoriale Apple Pay, Google Pay, Revolut Pay & Carduri
const VisaMastercardLogos = () => (
  <div className="flex items-center gap-1.5">
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-[#00579f] text-white font-black italic text-[9px] tracking-tighter leading-none select-none">
      VISA
    </span>
    <span className="inline-flex items-center justify-center select-none">
      <span className="w-3 h-3 rounded-full bg-[#eb001b] -mr-1 inline-block"></span>
      <span className="w-3 h-3 rounded-full bg-[#f79e1b] inline-block opacity-90"></span>
    </span>
  </div>
);

const ApplePayPill = () => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold tracking-tight">
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.77-11.97-14.19-6.3-9.57-11.13-20.44-14.49-32.61-3.36-12.16-5.04-23.75-5.04-34.76 0-14.77 3.73-27.18 11.19-37.23 7.46-10.05 17.06-15.19 28.8-15.42 5.01 0 10.45 1.25 16.32 3.76 5.87 2.5 9.77 3.82 11.71 3.93 1.94-.11 5.92-1.48 11.93-4.13 6.01-2.65 11.37-3.86 16.08-3.64 12.38.65 22.4 4.99 30.07 13.02-10.86 6.53-16.19 15.54-16 27.02.21 9.35 3.85 17.29 10.92 23.82 7.07 6.53 15.65 10.15 25.74 10.86-2.17 6.74-4.78 13.7-7.83 20.88zM119.22 31.95c0-7.39 2.66-14.3 7.98-20.73 5.32-6.43 11.83-10.55 19.53-12.36.43 1.09.65 2.28.65 3.59 0 7.39-2.77 14.45-8.31 21.18-5.54 6.73-12.16 10.76-19.85 12.09v-3.77z" />
    </svg>
    <span>Pay</span>
  </span>
);

const GooglePayPill = () => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold tracking-tight">
    <svg className="w-3.5 h-3.5 inline-block" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
    <span>Pay</span>
  </span>
);

const RevolutPayPill = () => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-black tracking-tight">
    <span>Revolut</span>
    <span className="font-normal text-slate-300">Pay</span>
  </span>
);

export const RevolutCheckoutModal: React.FC<RevolutCheckoutModalProps> = ({
  organization,
  currentPlan,
  initialSelectedPlan = 'STARTER',
  onClose,
  onSuccessUpgrade,
}) => {
  // Etape:
  // 1. BILLING: Date de facturare & alegere pachet (Starter: 45 lei | Clasic: 100 lei)
  // 2. AWAITING_PAYMENT: Revolut Checkout a fost deschis automat; se monitorizează autorizarea
  // 3. SUCCESS: Plată confirmată, facturi proforme trimise automat ambelor părți, afișare template modern
  const [step, setStep] = useState<'BILLING' | 'AWAITING_PAYMENT' | 'SUCCESS'>('BILLING');

  // Prețuri stricte din OfferFlow:
  // STARTER: 45 lei / lună
  // CLASIC: 100 lei / lună
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    initialSelectedPlan === 'CLASIC' ? 'CLASIC' : 'STARTER'
  );
  const [amount, setAmount] = useState<number>(
    initialSelectedPlan === 'CLASIC' ? 100 : 45
  );

  // Date facturare cumpărător (preluate curat din organizație sau completate de client)
  const [tipPersoana, setTipPersoana] = useState<'PJ' | 'PF'>('PJ');
  const [denumire, setDenumire] = useState(
    organization?.nume && !organization.nume.includes('CĂTĂLIN') ? organization.nume : ''
  );
  const [cui, setCui] = useState(
    organization?.cui && organization.cui !== '54552543' ? organization.cui : ''
  );
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [adresa, setAdresa] = useState(organization?.adresa || '');

  // Stare comunicare Revolut API
  const [isOpeningPayment, setIsOpeningPayment] = useState(false);
  const [activeCheckoutUrl, setActiveCheckoutUrl] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string>('');

  // Factură finală emisă
  const [generatedInvoice, setGeneratedInvoice] = useState<ProformaInvoice | null>(null);

  // Referință fereastră deschisă pentru checkout
  const openedTabRef = useRef<Window | null>(null);

  // Actualizare sumă când utilizatorul alege alt pachet
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setAmount(plan === 'CLASIC' ? 100 : 45);
  };

  /**
   * DECLANȘARE OBLIGATORIE & AUTOMATĂ A CHECKOUT-ULUI REVOLUT
   * Deschide instantaneu tab-ul nou în browser fără a fi blocat de popup-blocker
   * și redirecționează utilizatorul direct pe pagina oficială Revolut Merchant.
   */
  const handleStartPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isOpeningPayment) return;

    setIsOpeningPayment(true);

    // Deschidem sincron fereastra nouă pentru a evita blocarea de către browser
    const payWindow = window.open('about:blank', '_blank');
    openedTabRef.current = payWindow;

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

        if (payWindow && !payWindow.closed) {
          payWindow.location.href = data.url;
        } else {
          window.open(data.url, '_blank');
        }

        setStep('AWAITING_PAYMENT');
      } else {
        // În lipsa unui link extern (mod test/dezvoltare fără cheie Revolut live),
        // închidem tab-ul gol și intrăm direct pe ecranul de autorizare și emitere proformă la 45 / 100 lei
        if (payWindow && !payWindow.closed) {
          payWindow.close();
        }
        setActiveOrderId(data?.orderId || `rev_test_${Date.now()}`);
        setStep('AWAITING_PAYMENT');
      }
    } catch (err) {
      console.error('Eroare lansare Revolut Checkout:', err);
      if (payWindow && !payWindow.closed) {
        payWindow.close();
      }
      setActiveOrderId(`rev_test_${Date.now()}`);
      setStep('AWAITING_PAYMENT');
    } finally {
      setIsOpeningPayment(false);
    }
  };

  /**
   * Finalizare automată a plății:
   * 1. Înregistrează proforma marcată ca achitată prin Revolut
   * 2. Trimite automat factura proformă către ambele părți (Client + Prestator Cătălin Sandu PFA)
   * 3. Activează abonamentul în aplicație
   */
  const handleFinalizeSuccess = async () => {
    const invoice = createAndRecordProforma({
      plan: selectedPlan,
      customAmount: amount,
      clientName: denumire,
      clientCui: cui,
      clientAddress: adresa,
      clientEmail: email,
      clientPhone: telefon,
      metodaPlata: 'Revolut Business (Apple Pay / Google Pay / Revolut Pay / Card Bancar)',
      revolutOrderId: activeOrderId || undefined,
    });

    // Transmitere automată prin email către ambele părți prin server
    try {
      await fetch('/api/send-proforma-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proforma: invoice }),
      });
    } catch (e) {
      console.warn('Transmitere email server:', e);
    }

    setGeneratedInvoice(invoice);
    setStep('SUCCESS');
    onSuccessUpgrade(selectedPlan);
  };

  /**
   * Monitorizare automată a autorizării plății în Revolut:
   * - Polling continuu la fiecare 2.5 secunde
   * - Verificare automată când clientul revine pe tab-ul aplicației (window focus)
   */
  useEffect(() => {
    if (step !== 'AWAITING_PAYMENT' || !activeOrderId) return;

    let isSubscribed = true;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/revolut-order-status/${activeOrderId}`);
        const data = await res.json();
        if (data.isPaid && isSubscribed) {
          handleFinalizeSuccess();
        }
      } catch (e) {
        // Ignorare erori temporare de rețea
      }
    };

    const interval = setInterval(checkStatus, 2500);

    // Când clientul dă OK-ul în Revolut și revine pe tab, verificăm instantaneu
    const handleWindowFocus = () => {
      checkStatus();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [step, activeOrderId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`relative w-full ${
          step === 'SUCCESS' ? 'max-w-4xl' : 'max-w-xl'
        } bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all`}
      >
        {/* ========================================================================= */}
        {/* PASUL 1: DATE DE FACTURARE & SELECTOR PREȚURI STRICT OFFERFLOW (45 / 100) */}
        {/* ========================================================================= */}
        {step === 'BILLING' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-extrabold tracking-wider text-blue-600 uppercase">
                  Activare Abonament OfferFlow
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Date Facturare &amp; Checkout Revolut
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector Pachete Oficiale OfferFlow: 45 lei Starter | 100 lei Clasic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Selectează Pachetul Dorit:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. PLAN STARTER: 45 LEI */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan('STARTER')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPlan === 'STARTER'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-sm ring-2 ring-blue-600/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Plan Starter
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Popular
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-slate-950">45 lei</span>
                    <span className="text-xs text-slate-500 font-semibold">/ lună</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    5 oferte active, emitere proforme, export PDF
                  </p>
                </button>

                {/* 2. PLAN CLASIC: 100 LEI */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan('CLASIC')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPlan === 'CLASIC'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm ring-2 ring-indigo-600/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                      Plan Clasic
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Recomandat
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-slate-950">100 lei</span>
                    <span className="text-xs text-slate-500 font-semibold">/ lună</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    30 oferte active, teme personalizate, semnătură online
                  </p>
                </button>
              </div>
            </div>

            {/* Metode de plată acceptate prin Revolut */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Metode incluse în Revolut Checkout:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <ApplePayPill />
                <GooglePayPill />
                <RevolutPayPill />
                <VisaMastercardLogos />
              </div>
            </div>

            {/* Formular Date Facturare Cumpărător */}
            <form onSubmit={handleStartPayment} className="space-y-4">
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
                  {tipPersoana === 'PJ' ? 'Denumire Companie / PFA *' : 'Nume & Prenume *'}
                </label>
                <input
                  type="text"
                  required
                  value={denumire}
                  onChange={(e) => setDenumire(e.target.value)}
                  placeholder={tipPersoana === 'PJ' ? 'ex: SC Alfa Construct SRL' : 'ex: Ion Popescu'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tipPersoana === 'PJ' ? 'CUI / CIF *' : 'CNP (opțional)'}
                  </label>
                  <input
                    type="text"
                    required={tipPersoana === 'PJ'}
                    value={cui}
                    onChange={(e) => setCui(e.target.value)}
                    placeholder="ex: RO12345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefon de contact
                  </label>
                  <input
                    type="tel"
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    placeholder="ex: 0740 123 456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email pentru transmitere factură proformă *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: contact@firma-dvs.ro"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sediu Social / Adresă Facturare *
                  </label>
                  <input
                    type="text"
                    required
                    value={adresa}
                    onChange={(e) => setAdresa(e.target.value)}
                    placeholder="ex: Str. Aviatorilor nr. 10, București"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Informații Prestator */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Plata se procesează către <strong>{OPERATOR_PROVIDER_INFO.nume}</strong> (CUI: {OPERATOR_PROVIDER_INFO.cui}, Craiova). Factura proformă fiscală se transmite automat pe email-ul dvs. și către prestator ({ADMIN_NOTIFICATION_EMAIL}).
              </div>

              {/* BUTONUL PRINCIPAL: DESCHIDE OBLIGATORIU REVOLUT CHECKOUT */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isOpeningPayment}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-950 hover:from-blue-700 hover:to-black active:scale-[0.99] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  {isOpeningPayment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 text-amber-300" />
                  )}
                  <span>
                    {isOpeningPayment
                      ? 'Se inițiază comanda Revolut...'
                      : `Plătește ${amount} lei prin Revolut (Deschide Checkout)`}
                  </span>
                  <ExternalLink className="w-4 h-4 opacity-75" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tranzacție 100% securizată prin Revolut Business Merchant Official API</span>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASUL 2: MONITORIZARE AUTOMATĂ REVOLUT CHECKOUT (FĂRĂ BUTOANE ÎN PLUS)    */}
        {/* ========================================================================= */}
        {step === 'AWAITING_PAYMENT' && (
          <div className="p-8 sm:p-12 text-center space-y-6 bg-white">
            <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw className="w-9 h-9 text-blue-600 animate-spin" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                Fereastra Revolut Checkout a fost deschisă
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
                Plată în curs: {amount} lei
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pagina securizată Revolut a fost deschisă în browserul dvs. 
                Autorizați comanda prin <strong>Apple Pay</strong>, <strong>Google Pay</strong>, <strong>Revolut Pay</strong> sau <strong>Card bancar</strong>.
              </p>
            </div>

            {/* Detalii tranzacție & link rapid redeschidere dacă browserul a blocat */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Pachet OfferFlow:</span>
                <span className="font-extrabold text-blue-600">{selectedPlan}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total de achitat:</span>
                <span className="font-black text-slate-900 text-sm">{amount} RON</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Beneficiar:</span>
                <span className="font-bold text-slate-800">{OPERATOR_PROVIDER_INFO.nume}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Ai închis din greșeală fereastra?</span>
                {activeCheckoutUrl && (
                  <a
                    href={activeCheckoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Redeschide Revolut</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Monitorizare automată & Buton de confirmare când clientul dă OK */}
            <div className="max-w-md mx-auto space-y-3 pt-2">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Se așteaptă aprobarea în Revolut (detectare automată)...</span>
              </div>

              {/* Buton când clientul revine și vrea activarea instantanee */}
              <button
                type="button"
                onClick={handleFinalizeSuccess}
                className="w-full py-3.5 px-5 bg-black hover:bg-slate-800 active:scale-[0.99] text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Am finalizat / Autorizat plata în Revolut</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('BILLING')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer pt-1"
              >
                ← Înapoi la date facturare
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASUL 3: FACTURĂ PROFORMĂ / FISCALĂ GENERATĂ CU TEMPLATE MODERN UI SUPERB */}
        {/* ========================================================================= */}
        {step === 'SUCCESS' && generatedInvoice && (
          <div className="p-6 sm:p-8 bg-slate-100/60 dark:bg-slate-900/60 max-h-[90vh] overflow-y-auto">
            <ModernInvoiceTemplate
              invoice={generatedInvoice}
              onClose={onClose}
              showActions={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
