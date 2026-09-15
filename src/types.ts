/**
// OfferFlow - Core TypeScript Types & Domain Interfaces
// Modele de date conforme cu Schema Prisma / PostgreSQL
*/

export type UserRole = 'ADMIN' | 'MEMBER';
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'CLASIC';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
export type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'NEGOTIATION' | 'ACCEPTED' | 'REJECTED';
export type FeedbackAuthor = 'CLIENT' | 'ORGANIZATION';
export type FeedbackStatus = 'OPEN' | 'RESOLVED';
export type DashboardTheme = 'slate' | 'dark' | 'warm' | 'navy' | 'light';

export interface PlanConfig {
  name: string;
  priceRon: number;
  maxQuotes: number;
  badge?: string;
  description: string;
  features: string[];
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanConfig> = {
  FREE: {
    name: 'Free',
    priceRon: 0,
    maxQuotes: 2,
    description: 'Gratuit pentru testare și primele oferte trimise clienților',
    features: [
      'Maxim 2 oferte comerciale active',
      'Semnare digitală pe mobil & desktop',
      'Link securizat fără cont pentru clienți',
      'Catalog articole produse & servicii',
      'Branding discret OfferFlow',
    ],
  },
  STARTER: {
    name: 'Starter',
    priceRon: 45,
    maxQuotes: 5,
    badge: 'Recomandat pentru IMM',
    description: 'Ideal pentru profesioniști și mici echipe de vânzări',
    features: [
      'Maxim 5 oferte comerciale active',
      'White-label complet (fără watermark)',
      'Logo & date fiscale proprii pe ofertă',
      'Export PDF vectorial & print certificat',
      'Opționale interactive recalculate live',
      'Suport prioritar pe email & chat',
    ],
  },
  CLASIC: {
    name: 'Clasic',
    priceRon: 100,
    maxQuotes: 30,
    badge: 'Volum & Scalare',
    description: 'Pentru firme în creștere cu volum constant de oferte lunare',
    features: [
      'Maxim 30 oferte comerciale active',
      'Toate beneficiile din pachetul Starter',
      'Catalog nelimitat cu categorii multiple',
      'Urmărire avansată vizualizări & loguri eIDAS',
      'Descărcare dovadă legală semnare digitală',
      'Asistență dedicată telefonică & WhatsApp',
    ],
  },
};

// Tipuri de articole (Clasificare conform cerințelor comerciale B2B & Instalații/Servicii)
export type ItemType = 'produs' | 'serviciu' | 'pachet' | 'abonament';

export interface ItemTypeConfig {
  type: ItemType;
  label: string;
  shortLabel: string;
  description: string;
  icon: string; // Emoji sau icon identifier
  badgeClass: string;
  badgeColor: string; // Alias for badgeClass
}

export const ITEM_TYPE_CONFIGS: Record<ItemType, ItemTypeConfig> = {
  produs: {
    type: 'produs',
    label: 'Produs fizic / Material / Piesă',
    shortLabel: 'Produs / Material',
    description: 'ex: Țeavă cupru Ø15, Baterie Grohe, Robinet trecere, Cabluri, Echipamente',
    icon: '📦',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  serviciu: {
    type: 'serviciu',
    label: 'Manoperă / Montaj / Serviciu',
    shortLabel: 'Manoperă / Serviciu',
    description: 'ex: Montaj instalație sanitară baie, Înlocuire coloană, Punere în funcțiune',
    icon: '🛠️',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  },
  pachet: {
    type: 'pachet',
    label: 'Pachet Echipament + Manoperă',
    shortLabel: 'Pachet + Montaj',
    description: 'ex: Pachet Centrală Termică + Kit Montaj + Punere în funcțiune (PIF)',
    icon: '📦+🛠️',
    badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  },
  abonament: {
    type: 'abonament',
    label: 'Abonament / Recurent',
    shortLabel: 'Recurent / Abonament',
    description: 'ex: Mentenanță lunară, Revizie tehnică periodică, Suport 24/7',
    icon: '⏱️',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  },
};

// Unități de măsură predefinite și flexibile
export const STANDARD_UNITS_OF_MEASURE = [
  { value: 'buc', label: 'buc (bucăți)' },
  { value: 'ml', label: 'ml (metri liniari - ex: țevi, cabluri)' },
  { value: 'm', label: 'm (metri)' },
  { value: 'mp', label: 'mp (metri pătrați - ex: gresie, izolații)' },
  { value: 'mc', label: 'mc (metri cubi)' },
  { value: 'kg', label: 'kg (kilograme)' },
  { value: 'kit', label: 'kit / set / pachet' },
  { value: 'ore', label: 'ore (manoperă)' },
  { value: 'zile', label: 'zile (lucrări)' },
  { value: 'luni', label: 'luni (abonamente)' },
  { value: 'serviciu', label: 'serviciu / proiect' },
] as const;

export interface Organization {
  id: string;
  nume: string;
  cui: string;
  reg_com?: string;
  adresa?: string;
  iban?: string;
  moneda_implicita: string;
  logo_url?: string;
  brand_color: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  nume: string;
  rol: UserRole;
  created_at: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  revolut_customer_id?: string;
  revolut_order_id?: string;
  status: SubscriptionStatus;
  valid_until?: string;
  created_at: string;
}

export interface ProformaInvoice {
  id: string;
  serie_numar: string; // ex: PRO-OF-2026-0042
  data_emiterii: string;
  data_scadenta: string;
  furnizor: {
    nume: string;
    cui: string;
    reg_com?: string;
    sediu: string;
    tara: string;
    email: string;
    telefon: string;
    iban?: string;
    banca?: string;
  };
  client: {
    nume: string;
    cui?: string;
    reg_com?: string;
    adresa: string;
    email: string;
    telefon?: string;
  };
  plan: SubscriptionPlan;
  descriere_serviciu: string;
  valoare: number;
  moneda: string;
  stare: 'ACHITAT_CARD_REVOLUT' | 'IN_ASTEPTARE';
  metoda_plata: string;
  revolut_order_id?: string;
  revolut_transaction_id?: string;
  data_platii: string;
  transmis_client_email: string;
  transmis_admin_email: string;
  data_transmiterii: string;
}

export interface ProductService {
  id: string;
  organizationId: string;
  tip_articol?: ItemType; // produs | serviciu | pachet | abonament
  cod_articol?: string; // SKU sau Cod intern (ex: GROHE-232, CLD-02)
  producator?: string; // Producător / Brand / Model (ex: Grohe, Viega, Bosch, Romstal)
  categorie?: string; // Instalații Sanitare, Termice, Climatizare, Electrice, IT
  denumire: string;
  descriere?: string;
  pret_unitar: number;
  pret_cost?: number; // Preț de cost / achiziție intern (pentru calcul marjă profit)
  um: string; // Unitate măsură: buc, ml, mp, mc, kg, kit, ore, luni
  cota_tva: number; // 19, 9, 5, 0 (%)
  moneda: string; // RON, EUR, USD
  este_activ?: boolean;
  termen_livrare?: string;
  created_at: string;
  updated_at?: string;
}

export interface QuoteItem {
  id: string;
  quoteId?: string;
  tip_articol?: ItemType;
  cod_articol?: string;
  producator?: string;
  titlu: string;
  descriere?: string;
  cantitate: number;
  pret_unitar: number;
  discount_procent: number; // 0 - 100
  total: number;
  este_optional: boolean;
  este_selectat: boolean;
  um?: string;
  cota_tva?: number;
}

export interface QuoteFeedback {
  id: string;
  quoteId: string;
  quoteItemId?: string | null;
  autor: FeedbackAuthor;
  mesaj: string;
  status: FeedbackStatus;
  created_at: string;
}

export interface QuoteSignature {
  id: string;
  quoteId: string;
  semnatar_nume: string;
  semnatar_functie?: string;
  ip_address: string;
  user_agent: string;
  semnat_la: string;
  semnatura_data_url: string; // Base64 Canvas data URL
}

export interface Quote {
  id: string;
  organizationId: string;
  titlu: string;
  numar_oferta: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_cui?: string;
  valoare_totala: number;
  valoare_tva: number;
  moneda: string;
  status: QuoteStatus;
  public_token: string;
  view_count: number;
  expires_at?: string;
  termeni_plata?: string;
  note_interne?: string;
  created_at: string;
  updated_at: string;
  
  // Embedded relations for rich UI
  organization?: Organization;
  items: QuoteItem[];
  feedbacks?: QuoteFeedback[];
  signature?: QuoteSignature | null;
}

export interface QuoteCalculationResult {
  subtotal: number;
  totalDiscount: number;
  totalTva: number;
  totalGeneral: number;
  totalOptionalNeinclus: number;
}
