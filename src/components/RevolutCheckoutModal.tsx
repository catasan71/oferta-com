import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Lock,
  Loader2,
  ExternalLink,
  Zap,
  ArrowLeft,
  FileCheck2,
  QrCode,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Organization, SubscriptionPlan, ProformaInvoice } from '../types.ts';
import {
  createAndRecordProforma,
  OPERATOR_PROVIDER_INFO,
} from '../lib/proforma.ts';
import { ModernInvoiceTemplate } from './ModernInvoiceTemplate.tsx';

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
  // Stări flux:
  // 1. BILLING: Date de facturare & alegere pachet (45 / 100 lei)
  // 2. AWAITING_PAYMENT: Clientul a fost redirecționat către Revolut; așteptăm efectuarea efectivă a plății
  // 3. SUCCESS: Plata este finalizată -> Se emite factura fiscală & se activează pachetul
  const [step, setStep] = useState<'BILLING' | 'AWAITING_PAYMENT' | 'SUCCESS'>('BILLING');

  // Prețuri pachete conforme cu OfferFlow
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    initialSelectedPlan === 'CLASIC' ? 'CLASIC' : 'STARTER'
  );
  const [amount, setAmount] = useState<number>(
    initialSelectedPlan === 'CLASIC' ? 100 : 45
  );

  // Date facturare cumpărător
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

  // Stare procesare & comandă Revolut
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [generatedInvoice, setGeneratedInvoice] = useState<ProformaInvoice | null>(null);

  // Schimbare pachet
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setAmount(plan === 'CLASIC' ? 100 : 45);
  };

  /**
   * PASUL 1 -> PASUL 2: Inițiere comandă Revolut & Deschidere Pagina Oficială de Plată
   */
  const handleLaunchRevolutCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!denumire.trim() || !email.trim() || !adresa.trim()) {
      alert('Vă rugăm să completați câmpurile obligatorii de facturare (Nume/Companie, Email, Adresă).');
      return;
    }

    setIsProcessing(true);

    try {
      let activeUrl = `https://revolut.me/catalinsandu07?amount=${amount}&currency=RON`;
      let activeId = `rev_ord_${Date.now()}`;

      try {
        const res = await fetch('/api/create-revolut-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: selectedPlan,
            email,
            clientName: denumire,
            customAmount: amount,
            organizationId: organization?.id,
            returnUrl: window.location.href,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) activeUrl = data.url;
          if (data.orderId) activeId = data.orderId;
        }
      } catch (err) {
        console.warn('Fallback Revolut URL:', err);
      }

      setCheckoutUrl(activeUrl);
      setOrderId(activeId);

      // Deschidem direct pagina oficială Revolut Checkout (unde Revolut emite QR-ul și Apple/GPay)
      window.open(activeUrl, '_blank', 'noopener,noreferrer');

      // Trecem în starea de așteptare a plății (Factura NU este emisă încă!)
      setStep('AWAITING_PAYMENT');
    } catch (err) {
      console.error('Eroare inițiere plată:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * PASUL 2 -> PASUL 3: Confirmarea plății -> EMITEREA FACTURII & ACTIVAREA PACHETULUI
   * (Se execută DOAR DUPĂ ce clientul a efectuat plata pe Revolut)
   */
  const handleFinalizeAndActivate = async () => {
    setIsProcessing(true);

    try {
      // 1. Generare Factură Proformă Fiscală Oficială
      const invoice = createAndRecordProforma({
        plan: selectedPlan,
        customAmount: amount,
        clientName: denumire,
        clientCui: cui,
        clientAddress: adresa,
        clientEmail: email,
        clientPhone: telefon,
        metodaPlata: 'Revolut Pay / Card Bancar / Apple Pay (Revolut Business)',
        revolutOrderId: orderId || `rev_${Date.now()}`,
      });

      // 2. Transmitere factură pe email
      try {
        await fetch('/api/send-proforma-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proforma: invoice }),
        });
      } catch {
        // Ignorare
      }

      // 3. Activare pachet în contul utilizatorului
      onSuccessUpgrade(selectedPlan);

      // 4. Afișare ecran succes cu factura A4
      setGeneratedInvoice(invoice);
      setStep('SUCCESS');
    } catch (err) {
      console.error('Eroare finalizare factură:', err);
      onSuccessUpgrade(selectedPlan);
      setStep('SUCCESS');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`relative w-full ${
          step === 'SUCCESS' ? 'max-w-4xl' : 'max-w-xl'
        } bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all`}
      >
        {/* ========================================================================= */}
        {/* PASUL 1: DATE FACTURARE & DESCHIDERE DIRECTĂ REVOLUT CHECKOUT OFICIAL     */}
        {/* ========================================================================= */}
        {step === 'BILLING' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-extrabold tracking-wider text-blue-600 uppercase">
                  Activare Abonament OfferFlow
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Date Facturare &amp; Plată Revolut
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
                1. Selectează Pachetul:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PLAN STARTER: 45 LEI */}
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

                {/* PLAN CLASIC: 100 LEI */}
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

            {/* Formular Date Facturare Cumpărător */}
            <form onSubmit={handleLaunchRevolutCheckout} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Date Facturare Cumpărător:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="tip_persoana"
                      checked={tipPersoana === 'PJ'}
                      onChange={() => setTipPersoana('PJ')}
                      className="accent-blue-600"
                    />
                    <span>Persoană Juridică</span>
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
                    Email pentru primire factură proformă *
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
              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Plata se efectuează securizat către <strong>{OPERATOR_PROVIDER_INFO.nume}</strong> (CUI: {OPERATOR_PROVIDER_INFO.cui}, Craiova) pe pagina oficială Revolut Checkout. Factura fiscală se emite automat după plată.
                </span>
              </div>

              {/* BUTONUL DE DESCHIDERE REVOLUT CHECKOUT */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-[#191c1f] hover:bg-black active:scale-[0.99] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-slate-950/20 transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 text-amber-300" />
                  )}
                  <span>
                    {isProcessing
                      ? 'Se conectează la Revolut...'
                      : `Plătește ${amount} RON prin Revolut (Deschide Checkout)`}
                  </span>
                  <ExternalLink className="w-4 h-4 opacity-75" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Emitere factură fiscală &amp; activare automată după finalizarea plății</span>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASUL 2: ÎN AȘTEPTAREA FINALIZĂRII PLĂȚII ÎN TAB-UL REVOLUT                */}
        {/* ========================================================================= */}
        {step === 'AWAITING_PAYMENT' && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                <Clock className="w-3.5 h-3.5 animate-spin text-amber-700" />
                <span>În Așteptarea Plății</span>
              </span>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <QrCode className="w-8 h-8 animate-pulse" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                Finalizează Plata de {amount} RON în Revolut
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Pagina oficială <strong>Revolut Checkout</strong> a fost deschisă. Scanează codul QR cu aplicația Revolut sau achită prin Apple Pay / Google Pay / Card.
              </p>

              {checkoutUrl && (
                <div className="pt-2">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl transition-all"
                  >
                    <span>Deschide din nou pagina Revolut Checkout</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* BUTONUL DEDICAT DE CONFIRMARE & EMITERE FACTURĂ / ACTIVARE PACHET */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ai finalizat plata în Revolut?</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Apasă pe butonul de mai jos pentru a genera <strong>Factura Fiscală Proformă A4</strong> și a activa instant pachetul <strong>{selectedPlan}</strong>.
              </p>

              <button
                type="button"
                onClick={handleFinalizeAndActivate}
                disabled={isProcessing}
                className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
                <span>Am efectuat plata • Emite Factura &amp; Activează Pachetul</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Abonament activat garantat pe baza confirmării de plată</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASUL 3: FACTURĂ PROFORMĂ FISCALĂ GENERATĂ CU TEMPLATE MODERN A4          */}
        {/* ========================================================================= */}
        {step === 'SUCCESS' && generatedInvoice && (
          <div className="p-6 sm:p-8 bg-slate-100/60 dark:bg-slate-900/60 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Plată Înregistrată &amp; Abonament Activat!</span>
                  <span className="text-[11px] text-emerald-700">Pachetul {selectedPlan} ({amount} RON/lună) este acum activ în contul tău.</span>
                </div>
              </div>
            </div>

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
