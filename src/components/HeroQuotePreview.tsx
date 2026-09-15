import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  User,
  Calendar,
  Sparkles,
  Check,
  Eye,
  ExternalLink,
} from 'lucide-react';

export const HeroQuotePreview: React.FC = () => {
  // Stare pentru opționale interactive (vizitatorul poate bifa/debifa pentru a vedea recalcularea live a ofertei)
  const [optGroheChecked, setOptGroheChecked] = useState(true);
  const [optMaintenanceChecked, setOptMaintenanceChecked] = useState(true);

  // Prețuri reale din OfferFlow
  const basePrice = 5490 + 1757.5; // Centrală + Instalații = 7247.5
  const grohePrice = 385;
  const maintenancePrice = 650;

  const currentSubtotal =
    basePrice +
    (optGroheChecked ? grohePrice : 0) +
    (optMaintenanceChecked ? maintenancePrice : 0);

  const tva = Math.round(currentSubtotal * 0.19);
  const total = Math.round(currentSubtotal + tva);

  return (
    <div className="relative w-full select-none">
      {/* ========================================================================= */}
      {/* BADGE FLOTANT 1 (SUS-STÂNGA): 40% VITEZĂ ÎNCHIDERE (PĂSTRAT CU ANIMAȚIE) */}
      {/* ========================================================================= */}
      <motion.div
        animate={{ y: [-7, 7, -7] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -left-3 sm:-top-5 sm:-left-5 z-20 bg-white dark:bg-slate-900 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-extrabold"
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

      {/* ========================================================================= */}
      {/* BADGE FLOTANT 2 (JOS-DREAPTA): CLIENT CONECTAT ACUM (PĂSTRAT CU ANIMAȚIE) */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* CADRUL BROWSER / DISPOZITIV CARE PREZINTĂ OFERTA REALĂ GENERATĂ DE APLICAȚIE */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 dark:bg-slate-950 p-2 sm:p-2.5 rounded-3xl shadow-2xl border border-slate-300/40 dark:border-slate-800">
        {/* Bară de titlu browser cu linkul real de vizualizare */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 font-mono text-[10px] text-slate-300">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="truncate max-w-[210px] sm:max-w-[280px]">
              oferta-com-nine.vercel.app/view/tk-inst-titan-0210
            </span>
          </div>

          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 hidden sm:inline-block">
            Link Securizat Activ
          </span>
        </div>

        {/* COALA REALĂ DE OFERTĂ A4 (EXACT CUM O GENEREAZĂ APLICAȚIA OFFERFLOW) */}
        <div
          id="hero-real-quote-paper"
          className="bg-white text-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/90 relative overflow-hidden font-sans text-xs space-y-4"
        >
          {/* Dunga superioară oficială de brand */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          {/* 1. Antet Ofertă (Logo, Companie Emitentă & Număr Ofertă) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                TS
              </div>
              <div>
                <div className="text-xs font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                  <span>TechSol Digital Solutions SRL</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span>CUI: RO38941029</span>
                  <span>•</span>
                  <span>J40/12890/2021</span>
                  <span>•</span>
                  <span>București</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-0.5">
                Ofertă Comercială
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-slate-950">
                #OF-2026-0842
              </div>
              <div className="text-[9px] text-slate-400">
                Valabilă până la: <strong>15 Octombrie 2026</strong>
              </div>
            </div>
          </div>

          {/* 2. Părți Contractuale (Furnizor vs Beneficiar) */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] leading-snug">
            <div>
              <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">
                FURNIZOR (EMITENT):
              </span>
              <div className="font-extrabold text-slate-900">TechSol Solutions SRL</div>
              <div className="text-slate-500 text-[10px]">Str. Tehnologiei nr. 42, Sector 1</div>
              <div className="text-slate-500 text-[10px] font-mono">IBAN: RO49INGB000099990123</div>
            </div>
            <div className="border-l border-slate-200/80 pl-2.5">
              <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">
                BENEFICIAR (CLIENT):
              </span>
              <div className="font-extrabold text-slate-900">SkyLine Imobiliare SRL</div>
              <div className="text-slate-500 text-[10px]">CUI: RO39281920 • Mihai Ionescu</div>
              <div className="text-slate-500 text-[10px]">contact@skyline.ro • 0745 123 456</div>
            </div>
          </div>

          {/* 3. Titlu Ofertă */}
          <div className="pt-0.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-950">
              Proiect: Sistem Centrală Termică Bosch 24kW &amp; Instalație Sanitară Completă
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Echipamente, montaj autorizat ISCIR și opțiuni configurabile direct de către client.
            </p>
          </div>

          {/* 4. Tabel Articole Ofertă (cu opționale bifabile în timp real de vizitator!) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
              <span>Articole Ofertate</span>
              <span className="text-blue-600 font-extrabold normal-case tracking-normal">
                (Testează bifele opționale)
              </span>
            </div>

            {/* Articol Fix 1 */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-[11px] gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 truncate">
                  1. Centrală Condensare Bosch 24kW + Kit Evacuare + Montaj &amp; PIF
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Eficiență clasa A, filtru Salus antimagnetită, autorizare ISCIR (1 kit)
                </div>
              </div>
              <div className="text-right font-black text-slate-950 whitespace-nowrap font-mono">
                5.490 RON
              </div>
            </div>

            {/* Articol Fix 2 */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-[11px] gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 truncate">
                  2. Înlocuire &amp; refacere completă instalație sanitară baie
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Canelare pereți, pozare conducte cupru Ø15, robineți Viega PN30 (1 serv.)
                </div>
              </div>
              <div className="text-right font-black text-slate-950 whitespace-nowrap font-mono">
                1.757,50 RON
              </div>
            </div>

            {/* Articol Opțional 1 (Baterie Grohe) */}
            <div
              onClick={() => setOptGroheChecked(!optGroheChecked)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-[11px] gap-2 ${
                optGroheChecked
                  ? 'border-blue-500/50 bg-blue-50/50 text-slate-900'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 text-slate-400 line-through'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={optGroheChecked}
                  onChange={() => {}}
                  className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none w-3.5 h-3.5"
                />
                <div className="truncate">
                  <div className="font-bold flex items-center gap-1.5 truncate">
                    <span className="truncate">3. Baterie lavoar monocomandă Grohe Cosmopolitan</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-amber-100 text-amber-800 border border-amber-200 no-underline shrink-0">
                      Opțional
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 no-underline truncate">
                    Cartuș ceramic 28 mm SilkMove, finisaj cromat StarLight (1 buc)
                  </div>
                </div>
              </div>
              <div className="text-right font-black text-blue-600 whitespace-nowrap font-mono">
                +385 RON
              </div>
            </div>

            {/* Articol Opțional 2 (Mentenanță Anuală 24/7) */}
            <div
              onClick={() => setOptMaintenanceChecked(!optMaintenanceChecked)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-[11px] gap-2 ${
                optMaintenanceChecked
                  ? 'border-blue-500/50 bg-blue-50/50 text-slate-900'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 text-slate-400 line-through'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={optMaintenanceChecked}
                  onChange={() => {}}
                  className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none w-3.5 h-3.5"
                />
                <div className="truncate">
                  <div className="font-bold flex items-center gap-1.5 truncate">
                    <span className="truncate">4. Pachet Mentenanță Preventivă &amp; Asistență 24/7 (12 Luni)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-amber-100 text-amber-800 border border-amber-200 no-underline shrink-0">
                      Opțional
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 no-underline truncate">
                    Revizie tehnică semestrială inclusă + timp de răspuns prioritar sub 2h
                  </div>
                </div>
              </div>
              <div className="text-right font-black text-blue-600 whitespace-nowrap font-mono">
                +650 RON
              </div>
            </div>
          </div>

          {/* 5. Totaluri & Recalculare Live */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Ofertă Comercială (TVA 19% inclus):
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-950 font-mono tracking-tight">
                {total.toLocaleString('ro-RO')} <span className="text-xs font-bold text-slate-500">RON</span>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-medium">
              <div>Subtotal: {Math.round(currentSubtotal).toLocaleString('ro-RO')} RON</div>
              <div>TVA (19%): {tva.toLocaleString('ro-RO')} RON</div>
            </div>
          </div>

          {/* 6. Semnătura Digitală conform Regulamentului eIDAS */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-extrabold text-emerald-900 flex items-center gap-1">
                    <span>Semnat Digital de Client</span>
                    <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                      eIDAS
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Mihai Ionescu (Director Tehnic - SkyLine Imobiliare SRL)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black tracking-wider shadow-2xs">
                  VALIDAT JURIDIC
                </span>
              </div>
            </div>

            {/* Simulare trasare semnătură olografă SVG în direct */}
            <div className="h-8 bg-white/90 rounded-lg border border-dashed border-emerald-300 flex items-center justify-between px-2.5 overflow-hidden">
              <span className="text-[9px] text-slate-400 font-mono">Semnătură pe ecran touch:</span>
              <svg className="w-28 h-6" viewBox="0 0 160 35">
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
              <span className="text-[8px] font-mono text-emerald-700 font-bold">
                Audit #8a4c-9f
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
