import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  Eye,
  Lock,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Package,
  Layers,
  Clock,
  Send,
  Sliders,
  Check,
  Star,
  Users,
  Building,
} from 'lucide-react';
import { PLAN_LIMITS, SubscriptionPlan } from '../types.ts';
import { LegalTab } from './LegalModal.tsx';

interface LandingPageProps {
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onExploreDemo: () => void;
  onOpenLegal: (tab: LegalTab) => void;
  onSelectPlanUpgrade?: (plan: SubscriptionPlan) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreDemo,
  onOpenLegal,
  onSelectPlanUpgrade,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Stare interactivă pentru Mockup-ul din Hero (permite vizitatorului să bifeze opționalele live!)
  const [mockOptionalChecked, setMockOptionalChecked] = useState(true);
  const mockBasePrice = 3850;
  const mockOptionalPrice = 650;
  const mockCurrentSubtotal = mockOptionalChecked ? mockBasePrice + mockOptionalPrice : mockBasePrice;
  const mockTva = Math.round(mockCurrentSubtotal * 0.19);
  const mockTotal = mockCurrentSubtotal + mockTva;

  // Notificări dinamice live în colț (activitate recentă de semnare & deschidere)
  const [liveIndex, setLiveIndex] = useState(0);
  const [showLiveToast, setShowLiveToast] = useState(true);

  const liveEvents = [
    { text: 'Oferta #OF-2026-084 tocmai a fost semnată electronic', location: 'București', time: 'acum 18 secunde' },
    { text: 'SkyLine Imobiliare a deschis link-ul securizat pe mobil', location: 'Cluj-Napoca', time: 'acum 1 minut' },
    { text: 'Ofertă de 6.400 RON acceptată cu 1 opțional bifat', location: 'Timișoara', time: 'acum 3 minute' },
    { text: 'Ofertă nouă trimisă direct prin WhatsApp către client', location: 'Brașov', time: 'acum 5 minute' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveIndex((prev) => (prev + 1) % liveEvents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [liveEvents.length]);

  const faqs = [
    {
      q: 'Ce valoare juridică are semnătura digitală aplicată pe ofertă?',
      a: 'Semnătura electronică generată prin OfferFlow respectă pe deplin Regulamentul European eIDAS (UE nr. 910/2014) și Legea nr. 455/2001 din România. La semnare, sistemul înregistrează adresa IP a semnatarului, amprenta browserului (User-Agent), timestamp-ul exact în format UTC și starea exactă a articolelor acceptate, generând un rezumat de audit complet opozabil în justiție între profesioniști.',
    },
    {
      q: 'Clientul meu are nevoie de cont sau aplicație pentru a semna oferta?',
      a: 'Nu, absolut deloc! Acesta este cel mai mare avantaj OfferFlow. Clientul primește un link securizat prin WhatsApp, Email sau SMS, deschide pagina direct în browserul telefonului sau laptopului, analizează articolele, alege opționalele dorite și semnează cu degetul sau mouse-ul în mai puțin de 60 de secunde.',
    },
    {
      q: 'Cum funcționează articolele opționale negociabile?',
      a: 'Când creezi oferta, poți marca anumite produse sau servicii ca fiind „Opționale” (de exemplu: servicii de mentenanță extinsă, garanție suplimentară sau echipamente premium). Clientul poate bifa sau debifa aceste articole direct din linkul primit, iar totalul și TVA-ul se recalculează automat în timp real. Astfel elimini zecile de emailuri de reofertare!',
    },
    {
      q: 'Ce se întâmplă dacă depășesc limita de oferte din pachetul meu?',
      a: 'Pachetul gratuit (Free) îți permite să ai până la 2 oferte active. Când ai nevoie de mai multe oferte, poți face upgrade instant la Starter (45 RON / lună pentru 5 oferte) sau Clasic (100 RON / lună pentru 30 oferte). Plata este procesată securizat prin Revolut sau card bancar, fără perioadă contractuală obligatorie.',
    },
    {
      q: 'Pot descărca oferta în format PDF pentru contabilitate?',
      a: 'Da! Atât tu, cât și clientul tău puteți exporta oferta în format PDF vectorial de înaltă rezoluție, cu ștampila electronică de semnare, datele de identificare ale firmei tale și defalcarea clară a costurilor și cotelor de TVA.',
    },
    {
      q: 'Sunt datele companiei mele și ale clienților în siguranță?',
      a: 'Toate conexiunile sunt criptate SSL pe 256 de biți, iar datele sunt stocate exclusiv pe servere găzduite în Uniunea Europeană, în deplină conformitate cu Regulamentul General privind Protecția Datelor (GDPR - UE 2016/679). Datele tale nu sunt niciodată vândute sau utilizate în alte scopuri.',
    },
    {
      q: 'Pot adăuga propriul logo și date de identificare?',
      a: 'Desigur. În panoul de setări îți poți încărca logo-ul companiei, seta culorile oficiale de brand, codul fiscal CUI, contul bancar IBAN și datele de contact. În planurile Starter și Clasic, watermark-ul OfferFlow este complet eliminat (white-label).',
    },
    {
      q: 'Cum aflu când un client a deschis oferta trimisă?',
      a: 'OfferFlow monitorizează fiecare accesare a linkului public. În momentul în care clientul deschide pagina ofertei, contorul de vizualizări se actualizează automat în dashboard-ul tău, astfel încât să știi exact când este momentul optim pentru follow-up.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* 1. HEADER / BARA DE NAVIGARE */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Identitate */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight flex items-center gap-1.5 text-slate-900 dark:text-white">
                OfferFlow <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40">SaaS B2B</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Ofertare interactivă & semnare digitală
              </p>
            </div>
          </div>

          {/* Linkuri Meniu Desktop */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#functionalitati" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Funcționalități
            </a>
            <a href="#cum-functioneaza" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Cum Funcționează
            </a>
            <a href="#preturi" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pachete & Prețuri
            </a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Q&A
            </a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Contact
            </a>
          </nav>

          {/* Butoane CTA Autentificare & Revolut */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSelectPlanUpgrade && onSelectPlanUpgrade('STARTER')}
              className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Abonamente Revolut</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('LOGIN')}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Intră în Cont
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('REGISTER')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              Creează cont gratuit
            </button>
          </div>

          {/* Buton Meniu Mobil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            aria-label="Meniu navigare"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown Mobil */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 text-sm font-semibold">
            <a
              href="#functionalitati"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 dark:text-slate-200"
            >
              Funcționalități
            </a>
            <a
              href="#cum-functioneaza"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 dark:text-slate-200"
            >
              Cum Funcționează
            </a>
            <a
              href="#preturi"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 dark:text-slate-200"
            >
              Pachete & Prețuri
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 dark:text-slate-200"
            >
              Întrebări Frecvente (Q&A)
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 dark:text-slate-200"
            >
              Contact
            </a>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSelectPlanUpgrade) onSelectPlanUpgrade('STARTER');
                }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-blue-500/40 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Abonamente & Plăți Revolut</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('LOGIN');
                }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                Intră în Cont
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('REGISTER');
                }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-blue-600 text-white"
              >
                Creează cont gratuit
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION AERISIT (Value Prop Stânga + Mockup Ofertă Dreapta) */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Elemente de fundal discrete animate fluid */}
        <motion.div
          animate={{
            x: [-25, 25, -25],
            y: [-15, 15, -15],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[460px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/10 blur-3xl pointer-events-none -z-10 rounded-full"
        />
        <motion.div
          animate={{
            x: [20, -20, 20],
            y: [15, -15, 15],
            scale: [1.1, 0.95, 1.1],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-10 w-[420px] h-[360px] bg-gradient-to-bl from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Coloana Stânga: Propunerea de Valoare */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-xs">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </motion.span>
                <span>B2B SaaS • Semnătură Digitală eIDAS pe mobil & desktop</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.15]">
                Creează oferte interactive pe care clienții le{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                  semnează pe loc
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Fără documente PDF statice pierdute în spam. Trimite o pagină web securizată prin link, unde clienții bifează opționalele dorite, văd recalcularea instant și semnează digital direct de pe telefon.
              </p>

              {/* Butoane CTA Principale cu micro-interacțiuni */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => onOpenAuth('REGISTER')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
                >
                  <span className="relative z-10">Încearcă gratuit (2 oferte incluse)</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onExploreDemo}
                  className="w-full sm:w-auto px-5 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Vezi Demo Ofertă Live</span>
                </motion.button>
              </div>

              {/* Indicatori de încredere */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Nu necesită card bancar</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Conform eIDAS & Legea 455</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 col-span-2 sm:col-span-1">
                  <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Fără cont pentru client</span>
                </div>
              </div>
            </motion.div>

            {/* Coloana Dreapta: Mockup Interactiv Ofertă cu Animații Live */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="lg:col-span-6 relative"
            >
              {/* Badge flotant 1: rată de conversie cu animație fluidă sus-jos */}
              <motion.div
                animate={{ y: [-7, 7, -7] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 z-20 bg-white dark:bg-slate-900 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-extrabold"
              >
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <div className="text-slate-900 dark:text-white font-bold leading-tight">40% viteză închidere</div>
                  <div className="text-[10px] text-emerald-500 font-semibold">Semnare medie în 4 minute</div>
                </div>
              </motion.div>

              {/* Badge flotant 2: notificare live client conectat pe mobil */}
              <motion.div
                animate={{ y: [7, -7, 7] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-4 z-20 bg-white dark:bg-slate-900 border border-blue-500/40 text-blue-600 dark:text-blue-400 p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-extrabold"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-500 animate-pulse" />
                </div>
                <div>
                  <div className="text-slate-900 dark:text-white font-bold leading-tight">Client conectat acum</div>
                  <div className="text-[10px] text-blue-500 font-semibold">Vizualizare de pe smartphone</div>
                </div>
              </motion.div>

              {/* Containerul Ofertei Mockup */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-4">
                {/* Header Ofertă */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      TS
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tech Solutions B2B SRL</h4>
                      <p className="text-[10px] text-slate-400">Ofertă Comercială #OF-2026-084</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Interactiv & Negociabil
                  </span>
                </div>

                {/* Card Destinatar Client */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Destinatar:</span>
                    <div className="font-bold text-slate-900 dark:text-white">SkyLine Imobiliare SRL</div>
                    <div className="text-[11px] text-slate-500">CUI: RO39281920 • Proiect: Climatizare Birouri</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Link Securizat Deschis
                    </span>
                  </div>
                </div>

                {/* Tabel Articole Mockup (cu opționale bifabile live de vizitator!) */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Articole din Ofertă</span>
                    <span className="text-[10px] text-blue-500 font-semibold animate-pulse">(Testează bifa opțională de mai jos)</span>
                  </div>

                  {/* Articol Fix 1 */}
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Sistem Centrală & Climatizare VRV 14kW</div>
                      <div className="text-[10px] text-slate-400">Echipament + Montaj & Conexiuni frigorifice (1 kit)</div>
                    </div>
                    <div className="text-right font-extrabold text-slate-900 dark:text-white">
                      3.850 RON
                    </div>
                  </div>

                  {/* Articol Opțional Interactiv */}
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setMockOptionalChecked(!mockOptionalChecked)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs relative select-none ${
                      mockOptionalChecked
                        ? 'border-blue-500/50 bg-blue-500/10 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={mockOptionalChecked}
                        onChange={() => {}}
                        className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                      />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>Pachet Mentenanță Preventivă 12 Luni</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            Opțional
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">Revizie semestrială + Intervenție 24/7</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right font-extrabold text-blue-600 dark:text-blue-400">
                        +650 RON
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300">
                        Click
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Recalculare Live a Totalului cu tranziție numerică */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <div>
                    <span className="text-[11px] text-slate-500">Total General (TVA 19% inclus):</span>
                    <motion.div
                      key={mockTotal}
                      initial={{ scale: 0.95, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="text-lg font-black text-slate-950 dark:text-white"
                    >
                      {mockTotal.toLocaleString('ro-RO')} RON
                    </motion.div>
                  </div>
                  <div className="text-[10px] text-right text-slate-400">
                    <div>Subtotal: {mockCurrentSubtotal.toLocaleString('ro-RO')} RON</div>
                    <div>TVA (19%): {mockTva.toLocaleString('ro-RO')} RON</div>
                  </div>
                </div>

                {/* Zona de Semnătură Digitală Mockup cu Animație de Trasare Semnătură Cursivă */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <span>Semnat Digital de Client</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500 text-white font-bold animate-pulse">
                            eIDAS
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Mihai Ionescu (Director Tehnic) • ID eIDAS: 8a4c-9f
                        </div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black tracking-wider shadow-sm"
                    >
                      VALIDAT
                    </motion.div>
                  </div>

                  {/* Animație SVG a semnăturii trasate în direct pe ecran touch */}
                  <div className="h-10 bg-white/70 dark:bg-slate-950/60 rounded-xl border border-dashed border-emerald-500/30 flex items-center justify-between px-3 overflow-hidden">
                    <span className="text-[10px] text-slate-400 font-medium select-none">Semnătură ecran:</span>
                    <svg className="w-36 h-8" viewBox="0 0 160 35">
                      <motion.path
                        d="M 8 20 C 22 6, 32 28, 48 14 C 62 4, 72 30, 92 12 C 108 24, 122 10, 138 20 C 146 26, 152 14, 156 18"
                        fill="transparent"
                        stroke="#059669"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                        transition={{
                          duration: 4.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          times: [0, 0.5, 0.85, 1],
                        }}
                      />
                    </svg>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Certificat eIDAS
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. BARA DE STATISTICI & IMPACT */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { val: 'sub 3 min', label: 'Timp de creare & trimitere', color: 'text-blue-600 dark:text-blue-400' },
              { val: '+42%', label: 'Rată de acceptare oferte', color: 'text-emerald-600 dark:text-emerald-400' },
              { val: '100% Digital', label: 'Fără tipărire sau scanare', color: 'text-indigo-600 dark:text-indigo-400' },
              { val: 'eIDAS & GDPR', label: 'Conformitate juridică România/UE', color: 'text-slate-900 dark:text-white' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ scale: 1.05, y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.val}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. BENEFICII CHEIE (FEATURES) */}
      <section id="functionalitati" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Funcționalități B2B Esențiale
            </h2>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Construit special pentru IMM-uri
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Fiecare detaliu al platformei este conceput pentru a elimina barierele și ezitările dintre tine și clientul tău și pentru a accelera semnarea contractelor.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                bg: 'bg-emerald-500/10',
                color: 'text-emerald-600 dark:text-emerald-400',
                title: 'Semnătură Digitală Legală eIDAS',
                desc: 'Clientul semnează cu degetul pe telefon sau cu mouse-ul pe PC. Fiecare semnare generează certificat cu IP, User-Agent și Timestamp UTC conform Legii 455/2001.',
              },
              {
                icon: Sliders,
                bg: 'bg-blue-500/10',
                color: 'text-blue-600 dark:text-blue-400',
                title: 'Opționale Recalculate în Timp Real',
                desc: 'Adaugă servicii sau produse opționale (mentenanță, garanție suplimentară). Clientul le poate bifa/debifa direct pe pagină, iar totalul se recalculează instant.',
              },
              {
                icon: Send,
                bg: 'bg-indigo-500/10',
                color: 'text-indigo-600 dark:text-indigo-400',
                title: 'Trimitere Directă prin WhatsApp & Email',
                desc: 'Generezi un link securizat unic pentru fiecare client. Fără PDF-uri grele atașate, fără riscul de a ajunge în spam. Deschidere rapidă pe orice dispozitiv.',
              },
              {
                icon: Eye,
                bg: 'bg-amber-500/10',
                color: 'text-amber-600 dark:text-amber-400',
                title: 'Alerte & Tracking Deschidere Ofertă',
                desc: 'Știi exact în momentul în care clientul a deschis oferta și de câte ori a revizuit-o, oferindu-ți un avantaj major în negocierea comercială.',
              },
              {
                icon: Package,
                bg: 'bg-purple-500/10',
                color: 'text-purple-600 dark:text-purple-400',
                title: 'Catalog de Articole & Manoperă',
                desc: 'Salvează produsele, piesele, manopera și abonamentele recurente în catalogul tău. La crearea unei oferte noi, adaugi articolele printr-un simplu click.',
              },
              {
                icon: Building,
                bg: 'bg-rose-500/10',
                color: 'text-rose-600 dark:text-rose-400',
                title: 'Branding Propriu & Export PDF',
                desc: 'Logo-ul tău, culorile companiei și datele fiscale complete. Exportă oricând în format PDF vectorial gata de trimis la contabilitate.',
              },
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-blue-500/30 transition-all space-y-3 group"
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${feat.bg} ${feat.color} flex items-center justify-center font-bold group-hover:scale-110 transition-transform`}
                >
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CUM FUNCȚIONEAZĂ (PAS CU PAS) */}
      <section id="cum-functioneaza" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Flux Simplu & Intuitiv
            </h2>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Cum trimiți o ofertă semnată în 4 pași simpli
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: 1,
                bg: 'bg-blue-600',
                title: 'Selectezi din Catalog',
                desc: 'Alegi produsele sau manopera din catalogul tău prestabilit sau adaugi linii noi de ofertă.',
              },
              {
                num: 2,
                bg: 'bg-indigo-600',
                title: 'Marchezi Opționalele',
                desc: 'Configurezi articolele opționale pentru a oferi clientului libertatea de a alege pachetul ideal.',
              },
              {
                num: 3,
                bg: 'bg-purple-600',
                title: 'Trimiți Linkul Securizat',
                desc: 'Copiezi linkul și îl transmiți pe WhatsApp, Email sau SMS. Clientul îl deschide instantaneu.',
              },
              {
                num: 4,
                bg: 'bg-emerald-600',
                title: 'Semnare pe Ecran',
                desc: 'Clientul semnează cu degetul pe ecran. Ambele părți primesc confirmarea și certificatul de audit.',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative hover:shadow-xl hover:border-blue-500/30 transition-all"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${step.bg} text-white font-black text-sm flex items-center justify-center mb-4 shadow-md`}
                >
                  {step.num}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PACHETE DE CONT & PREȚURI (PRICING) */}
      <section id="preturi" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Pachete Transparente & Fără Costuri Ascunse
            </h2>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Alege pachetul potrivit pentru volumul tău
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Începe gratuit și fă upgrade doar când afacerea ta are nevoie de mai multe oferte.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* 1. PLANUL FREE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Free</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Gratuit
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">0 RON</span>
                  <span className="text-xs text-slate-500 font-semibold">/ gratuit</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {PLAN_LIMITS.FREE.description}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Ce include:</div>
                  {PLAN_LIMITS.FREE.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => onOpenAuth('REGISTER')}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Creează cont Free
                </button>
              </div>
            </motion.div>

            {/* 2. PLANUL STARTER (Cel mai popular) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.12 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 rounded-3xl p-7 flex flex-col justify-between shadow-xl shadow-blue-500/10 relative"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Cel Mai Recomandat
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Starter</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    45 RON / lună
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">45 RON</span>
                  <span className="text-xs text-slate-500 font-semibold">/ lună</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {PLAN_LIMITS.STARTER.description}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Ce include:</div>
                  {PLAN_LIMITS.STARTER.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectPlanUpgrade) {
                      onSelectPlanUpgrade('STARTER');
                    } else {
                      onOpenAuth('REGISTER');
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Alege Starter (45 RON)
                </button>
              </div>
            </motion.div>

            {/* 3. PLANUL CLASIC */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.24 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Clasic</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    100 RON / lună
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">100 RON</span>
                  <span className="text-xs text-slate-500 font-semibold">/ lună</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {PLAN_LIMITS.CLASIC.description}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Ce include:</div>
                  {PLAN_LIMITS.CLASIC.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectPlanUpgrade) {
                      onSelectPlanUpgrade('CLASIC');
                    } else {
                      onOpenAuth('REGISTER');
                    }
                  }}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Alege Clasic (100 RON)
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. ÎNTREBĂRI FRECVENTE (Q&A ACCORDION) */}
      <section id="faq" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Q&A Complet
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Întrebări frecvente despre OfferFlow
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tot ce trebuie să știi despre valoarea juridică, fluxul de lucru și abonamente.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-xs sm:text-sm cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CTA FINAL B2B */}
      <section className="py-20 sm:py-24 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Gata să trimiți oferte pe care clienții le semnează în câteva minute?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Creează-ți primul cont gratuit, adaugă articolele și trimite o ofertă comercială modernă chiar astăzi.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              type="button"
              onClick={() => onOpenAuth('REGISTER')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              Începe Acum Gratuit (2 Oferte Incluse)
            </motion.button>
            <motion.button
              type="button"
              onClick={onExploreDemo}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl text-sm font-bold transition-all cursor-pointer"
            >
              Accesează Panoul Demonstrativ
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* 9. FOOTER COMPLET & DATE JURIDICE / ANPC */}
      <footer id="contact" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-14 pb-10 text-slate-600 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Coloana 1: Brand & Descriere */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  OF
                </div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">OfferFlow SaaS</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Platforma dedicată companiilor și profesioniștilor din România și UE pentru generarea, transmiterea prin link securizat și semnarea electronică eIDAS a ofertelor comerciale.
              </p>
              <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Operat de: Catalin Sandu PFA • CUI: 54552543
                </div>
                <div>Sediu: Craiova, România</div>
                <div>Conformitate Regulament eIDAS (UE) 910/2014 & GDPR (UE) 2016/679</div>
              </div>
            </div>

            {/* Coloana 2: Navigare Rapidă */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Navigare
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#functionalitati" className="hover:text-blue-600 transition-colors">Funcționalități</a>
                </li>
                <li>
                  <a href="#cum-functioneaza" className="hover:text-blue-600 transition-colors">Cum funcționează</a>
                </li>
                <li>
                  <a href="#preturi" className="hover:text-blue-600 transition-colors">Pachete & Prețuri</a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-blue-600 transition-colors">Întrebări Frecvente (Q&A)</a>
                </li>
              </ul>
            </div>

            {/* Coloana 3: Informații Legale */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Legal & GDPR
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenLegal('TERMS')}
                    className="hover:text-blue-600 transition-colors cursor-pointer text-left"
                  >
                    Termeni și Condiții
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenLegal('GDPR')}
                    className="hover:text-blue-600 transition-colors cursor-pointer text-left"
                  >
                    Politica de Confidențialitate (GDPR)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenLegal('COOKIES')}
                    className="hover:text-blue-600 transition-colors cursor-pointer text-left"
                  >
                    Politica Cookies
                  </button>
                </li>
              </ul>
            </div>

            {/* Coloana 4: Date de Contact */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Contact & Suport
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <a href="mailto:office@developly.pro" className="hover:underline text-slate-800 dark:text-slate-200 font-semibold">
                    office@developly.pro
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <a href="tel:0765263860" className="hover:underline text-slate-800 dark:text-slate-200">
                    0765263860
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Craiova, România</span>
                </div>
                <div className="pt-1 text-[11px] text-slate-400">
                  Catalin Sandu PFA • CUI: 54552543
                </div>
              </div>
            </div>
          </div>

          {/* CELE 2 LINK-URI OBLIGATORII ANPC (SAL & SOL) */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center sm:text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3">
              Soluționarea Litigiilor & Drepturile Consumatorilor (ANPC):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {/* Link 1: ANPC SAL */}
              <a
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all flex items-center justify-between group cursor-pointer"
                title="Autoritatea Națională pentru Protecția Consumatorilor - Soluționarea Alternativă a Litigiilor"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                    SAL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      ANPC - Soluționarea Alternativă a Litigiilor
                    </div>
                    <div className="text-[10px] text-slate-500">anpc.ro/ce-este-sal</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
              </a>

              {/* Link 2: Comisia Europeană SOL */}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all flex items-center justify-between group cursor-pointer"
                title="Comisia Europeană - Soluționarea Online a Litigiilor"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-700 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                    SOL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      Comisia Europeană - Litigii Online
                    </div>
                    <div className="text-[10px] text-slate-500">ec.europa.eu/consumers/odr</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
              </a>
            </div>
          </div>

          {/* Copyright & Info final */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © {new Date().getFullYear()} OfferFlow. Toate drepturile rezervate. Dezvoltat pentru IMM-uri din România.
            </div>
            <div className="flex items-center gap-4">
              <span>GDPR Compliant</span>
              <span>•</span>
              <span>eIDAS Qualified Legal Standards</span>
              <span>•</span>
              <span>Secured by SSL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
