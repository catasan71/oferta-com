import React, { useState } from 'react';
import { Organization, SubscriptionPlan } from '../types.ts';
import { 
  SUBSCRIPTION_PLANS, 
  ADMIN_NOTIFICATION_EMAIL, 
  OPERATOR_PROVIDER_NAME,
  PaymentTransaction,
  recordPaymentTransaction 
} from '../lib/revolut.ts';
import { 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Check, 
  ExternalLink,
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react';

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
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan>(
    initialSelectedPlan === 'FREE' ? 'STARTER' : initialSelectedPlan
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Date Cumpărător
  const [buyerName, setBuyerName] = useState(organization.nume || 'Sandu Cătălin');
  const [buyerCompany, setBuyerCompany] = useState(organization.nume || 'SANDU M.I. CĂTĂLIN PFA');
  const [buyerEmail, setBuyerEmail] = useState(organization.email || 'catalinsandu07@gmail.com');
  const [buyerPhone, setBuyerPhone] = useState(organization.telefon || '+40765263860');

  const selectedPlan = SUBSCRIPTION_PLANS[selectedPlanId];
  const priceRon = selectedPlan.price;

  const handlePay = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Apel către API Revolut pentru generarea comenzii cu suma exactă (45 RON sau 100 RON)
      const res = await fetch('/api/create-revolut-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlanId,
          customAmount: priceRon,
          email: buyerEmail,
          clientName: buyerName,
        }),
      });

      const data = await res.json();

      if (data && data.success && data.url) {
        // Deschidere pagină oficială generată de Revolut cu suma corectă
        window.open(data.url, '_blank', 'noopener,noreferrer');

        // Înregistrare tranzacție & Notificare administrator
        const txnId = `TXN-${Date.now().toString().slice(-6)}`;
        const newTxn: PaymentTransaction = {
          id: `txn_${Date.now()}`,
          transactionNumber: txnId,
          plan: selectedPlanId,
          planName: selectedPlan.name,
          amount: priceRon,
          currency: 'RON',
          buyerName: buyerName.trim() || 'Sandu Cătălin',
          buyerCompany: buyerCompany.trim() || 'SANDU M.I. CĂTĂLIN PFA',
          buyerEmail: buyerEmail.trim() || ADMIN_NOTIFICATION_EMAIL,
          buyerPhone: buyerPhone.trim() || '+40765263860',
          paymentMethod: `Revolut Pay (${priceRon} RON)`,
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
          notifiedAdminEmail: ADMIN_NOTIFICATION_EMAIL,
        };

        recordPaymentTransaction(newTxn);

        // Activare cont instant
        onSuccessUpgrade(selectedPlanId);
        setIsLoading(false);
        onClose();
      } else {
        // Afișare eroare explicită de la API
        setErrorMessage(
          data?.error || 
          'Revolut API nu a putut genera linkul dinamic. Asigurați-vă că REVOLUT_API_KEY este setată corect în Vercel.'
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Eroare apel Revolut API:', err);
      setErrorMessage(
        `Eroare la apelarea serverului: ${err.message || 'Verificați conexiunea la internet sau setările Vercel.'}`
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header Modal */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/25">
              R
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Plată &amp; Activare Pachet
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Către {OPERATOR_PROVIDER_NAME}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Mesaj de Eroare dacă există */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Eroare Revolut:</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* 1. Selector Pachet (45 lei vs 100 lei) */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">
              Alege Pachetul Dorit
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['STARTER', 'CLASIC'] as SubscriptionPlan[]).map((pId) => {
                const p = SUBSCRIPTION_PLANS[pId];
                const isSelected = selectedPlanId === pId;
                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(pId);
                      setErrorMessage(null);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
                      {p.price} <span className="text-xs font-bold text-slate-500">RON / lună</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Beneficii Pachet Selectat */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Include în {selectedPlan.name}:
            </p>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              {selectedPlan.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Date Cumpărător / Facturare */}
          <div className="space-y-2.5">
            <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">
              Date Cumpărător (Pentru Confirmare &amp; Factură)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nume &amp; Prenume
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 pl-8 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="Sandu Cătălin"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Companie / PFA
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={buyerCompany}
                    onChange={(e) => setBuyerCompany(e.target.value)}
                    className="w-full px-3 py-2 pl-8 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="SANDU M.I. CĂTĂLIN PFA"
                  />
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-3 py-2 pl-8 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="catalinsandu07@gmail.com"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Telefon
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 pl-8 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="+40765263860"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Butonul Principal de Plată prin Revolut */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handlePay}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Se generează comanda Revolut ({priceRon} RON)...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Plătește {priceRon} RON prin Revolut &amp; Activează</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-90" />
                </>
              )}
            </button>
          </div>

          {/* Notificare de confirmare */}
          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Notificare automată de tranzacție expediată la <strong>{ADMIN_NOTIFICATION_EMAIL}</strong></span>
          </div>

        </div>

      </div>
    </div>
  );
};
