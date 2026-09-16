import { SubscriptionPlan } from '../types.ts';

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: string;
  description: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Plan Gratuit',
    price: 0,
    period: 'gratuit',
    description: 'Pentru testare și oferte ocazionale',
    features: [
      'Maxim 2 oferte comerciale active',
      'Catalog de bază articole',
      'Semnare digitală standard',
    ],
  },
  STARTER: {
    id: 'STARTER',
    name: 'Pachet Starter',
    price: 45,
    period: 'lunar',
    badge: 'Recomandat IMM & PFA',
    popular: true,
    description: 'Complet pentru profesioniști și afaceri în creștere',
    features: [
      'Până la 5 oferte comerciale active simultan',
      'Branding propriu complet (Logo & Culori)',
      'Export PDF profesional de înaltă rezoluție',
      'Semnare digitală pe mobil și desktop',
      'Notificări automate la deschiderea ofertei de către client',
    ],
  },
  CLASIC: {
    id: 'CLASIC',
    name: 'Pachet Clasic',
    price: 100,
    period: 'lunar',
    badge: 'Volum & Echipe',
    popular: false,
    description: 'Pentru societăți, cabinete și companii cu volum mare',
    features: [
      'Până la 30 oferte comerciale active simultan',
      'Catalog extins nelimitat',
      'Toate facilitățile din pachetul Starter',
      'Urmărire avansată status & loguri de semnare eIDAS',
      'Asistență prioritară',
    ],
  },
};

export const ADMIN_NOTIFICATION_EMAIL = 'catalinsandu07@gmail.com';
export const OPERATOR_PROVIDER_NAME = 'SANDU M.I. CĂTĂLIN PERSOANĂ FIZICĂ AUTORIZATĂ';

// Link-uri implicite Revolut Checkout (pot fi modificate oricând din UI sau variabile)
export const DEFAULT_REVOLUT_PAYMENT_LINK_STARTER = 
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_REVOLUT_LINK_STARTER) ||
  'https://checkout.revolut.com/payment-link/3a483e5a-1c72-49f2-93e6-9342a524dced';

export const DEFAULT_REVOLUT_PAYMENT_LINK_CLASIC = 
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_REVOLUT_LINK_CLASIC) ||
  'https://checkout.revolut.com/payment-link/3a483e5a-1c72-49f2-93e6-9342a524dced';

export const getRevolutPaymentLink = (plan: SubscriptionPlan): string => {
  try {
    if (plan === 'CLASIC') {
      return localStorage.getItem('offerflow_revolut_link_clasic') || DEFAULT_REVOLUT_PAYMENT_LINK_CLASIC;
    }
    return localStorage.getItem('offerflow_revolut_link_starter') || DEFAULT_REVOLUT_PAYMENT_LINK_STARTER;
  } catch {
    return plan === 'CLASIC' ? DEFAULT_REVOLUT_PAYMENT_LINK_CLASIC : DEFAULT_REVOLUT_PAYMENT_LINK_STARTER;
  }
};

export const setRevolutPaymentLink = (plan: SubscriptionPlan, url: string): void => {
  try {
    if (plan === 'CLASIC') {
      localStorage.setItem('offerflow_revolut_link_clasic', url.trim());
    } else {
      localStorage.setItem('offerflow_revolut_link_starter', url.trim());
    }
  } catch (e) {
    console.error('Eroare salvare link Revolut:', e);
  }
};

export interface PaymentTransaction {
  id: string;
  transactionNumber: string;
  plan: SubscriptionPlan;
  planName: string;
  amount: number;
  currency: string;
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  notifiedAdminEmail: string;
}

const STORAGE_KEY_TRANSACTIONS = 'offerflow_payment_transactions';

export const getPaymentTransactions = (): PaymentTransaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Eroare citire tranzacții:', err);
    return [];
  }
};

export const recordPaymentTransaction = (txn: PaymentTransaction): void => {
  try {
    const list = getPaymentTransactions();
    list.unshift(txn);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(list));
    console.log(`[NOTIFICARE EMAIL ADMIN]: Tranzacție înregistrată. Notificare către ${ADMIN_NOTIFICATION_EMAIL}:`, txn);
  } catch (err) {
    console.error('Eroare salvare tranzacție locală:', err);
  }

  // Notificare persistentă pe server (dacă există backend activ)
  fetch('/api/notify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction: txn }),
  }).catch((err) => {
    console.warn('Nu s-a putut trimite notificarea pe server (mod static/Vercel):', err);
  });
};
