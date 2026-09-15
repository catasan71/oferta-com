import React, { useState } from 'react';
import {
  Building2,
  Palette,
  Check,
  Sun,
  Moon,
  Coffee,
  Shield,
  Sparkles,
  X,
  CreditCard,
  FileText,
  Download,
  Mail,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Organization, DashboardTheme, ProformaInvoice } from '../types.ts';
import { THEME_OPTIONS } from '../lib/themes.ts';
import { getSavedProformas, exportProformaToPdf, OPERATOR_PROVIDER_INFO, ADMIN_NOTIFICATION_EMAIL } from '../lib/proforma.ts';

interface CompanySettingsModalProps {
  organization: Organization;
  onSave: (updated: Organization) => void;
  onClose: () => void;
  isStarterPlan: boolean;
  currentTheme?: DashboardTheme;
  onSelectTheme?: (theme: DashboardTheme) => void;
  onOpenRevolutCheckout?: () => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  organization,
  onSave,
  onClose,
  isStarterPlan,
  currentTheme = 'slate',
  onSelectTheme,
  onOpenRevolutCheckout,
}) => {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'APPEARANCE' | 'BILLING'>('COMPANY');
  const [nume, setNume] = useState(organization.nume);
  const [cui, setCui] = useState(organization.cui);
  const [regCom, setRegCom] = useState(organization.reg_com || '');
  const [adresa, setAdresa] = useState(organization.adresa || '');
  const [iban, setIban] = useState(organization.iban || '');
  const [logoUrl, setLogoUrl] = useState(organization.logo_url || '');
  const [brandColor, setBrandColor] = useState(organization.brand_color || '#3b82f6');
  const [savedProformas] = useState<ProformaInvoice[]>(() => getSavedProformas());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...organization,
      nume,
      cui,
      reg_com: regCom,
      adresa,
      iban,
      logo_url: logoUrl,
      brand_color: brandColor,
      updated_at: new Date().toISOString(),
    });
    onClose();
  };

  const presetColors = ['#3b82f6', '#0ea5e9', '#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#0f172a'];

  const getThemeIcon = (id: DashboardTheme) => {
    switch (id) {
      case 'dark':
        return <Moon className="w-4 h-4 text-sky-400" />;
      case 'warm':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'navy':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'slate':
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'light':
      default:
        return <Sun className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Setări Cont & Personalizare</h3>
              <p className="text-xs text-slate-400">Date companie, culori fundal și teme vizuale</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/70 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('COMPANY')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'COMPANY'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Date Companie & Facturare</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APPEARANCE')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'APPEARANCE'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Culori & Teme Fundal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BILLING')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BILLING'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Abonament & Proforme</span>
            {savedProformas.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
                {savedProformas.length}
              </span>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: DATE COMPANIE */}
          {activeTab === 'COMPANY' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nume Companie / PFA *
                </label>
                <input
                  type="text"
                  value={nume}
                  onChange={(e) => setNume(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CUI / CIF *
                  </label>
                  <input
                    type="text"
                    value={cui}
                    onChange={(e) => setCui(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nr. Reg. Comerțului
                  </label>
                  <input
                    type="text"
                    value={regCom}
                    onChange={(e) => setRegCom(e.target.value)}
                    placeholder="ex: F16/123/2021"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sediu Social / Adresă
                </label>
                <input
                  type="text"
                  value={adresa}
                  onChange={(e) => setAdresa(e.target.value)}
                  placeholder="ex: Craiova, Dolj, România"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cont IBAN (pentru încasare comenzi clienți)
                </label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="ex: RO49INGB0000999901234567"
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CULORI, TEME & ASPECT */}
          {activeTab === 'APPEARANCE' && (
            <div className="space-y-6">
              {/* 1. Selector Culoare Fundal Dashboard */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Culoare Fundal & Temă Dashboard
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Selectează nuanța de fundal pentru spațiul tău de lucru. Se aplică instantaneu.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_OPTIONS.map((opt) => {
                    const isSelected = currentTheme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSelectTheme && onSelectTheme(opt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl shrink-0 border flex items-center justify-center shadow-2xs relative overflow-hidden"
                          style={{
                            backgroundColor: opt.swatchBg,
                            borderColor: opt.swatchBorder,
                          }}
                        >
                          <div
                            className="w-4 h-4 rounded-md shadow-xs"
                            style={{ backgroundColor: opt.swatchAccent }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                              {getThemeIcon(opt.id)}
                              <span className="truncate">{opt.label.split('(')[0].trim()}</span>
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {opt.tag}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Personalizare Culoare Brand & White-Label */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Culoare Brand Oferte (White-Label)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Culoarea principală aplicată pe antetul ofertelor, butoane și PDF-uri.
                    </p>
                  </div>
                  {!isStarterPlan && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Necesită Starter
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Alege Culoare Accent
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 shadow-2xs"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {presetColors.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setBrandColor(col)}
                          style={{ backgroundColor: col }}
                          className={`w-7 h-7 rounded-full border border-black/10 transition-transform cursor-pointer ${
                            brandColor === col ? 'scale-125 ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400 ml-auto font-bold">
                      {brandColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Logo Companie
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://domeniu.ro/logo.png"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    {logoUrl && (
                      <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABONAMENT & FACTURI PROFORME */}
          {activeTab === 'BILLING' && (
            <div className="space-y-5">
              {/* Card Plan Activ */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Stare Abonament
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isStarterPlan
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {isStarterPlan ? 'ACTIV • PLAN STARTER' : 'PLAN FREE'}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-1">
                    {isStarterPlan
                      ? 'Acces complet: Oferte Active & White-Label'
                      : 'Activează Planul Starter pentru a debloca ofertele'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Procesare securizată a plăților prin <strong>Revolut Pay</strong>
                  </p>
                </div>

                {!isStarterPlan && onOpenRevolutCheckout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRevolutCheckout();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Activează Starter (45 RON)</span>
                  </button>
                )}
              </div>

              {/* Informații Operator Fiscal */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Operator Fiscal & Emitent Facturi Proforme:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                  <div>
                    <strong>{OPERATOR_PROVIDER_INFO.nume}</strong> • CUI: {OPERATOR_PROVIDER_INFO.cui}
                  </div>
                  <div>
                    Sediu: {OPERATOR_PROVIDER_INFO.sediu}
                  </div>
                  <div>
                    Email: <a href={`mailto:${ADMIN_NOTIFICATION_EMAIL}`} className="text-blue-600 dark:text-blue-400 underline">{ADMIN_NOTIFICATION_EMAIL}</a>
                  </div>
                  <div>
                    Tel: {OPERATOR_PROVIDER_INFO.telefon}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  La fiecare plată cu cardul, factura proformă se transmite automat pe email-ul dvs. și către administrație ({ADMIN_NOTIFICATION_EMAIL}).
                </p>
              </div>

              {/* Lista Facturilor Proforme */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Istoric Facturi Proforme Emise ({savedProformas.length})
                  </h4>
                </div>

                {savedProformas.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-medium">Nicio factură proformă emisă încă.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      La efectuarea unei plăți prin Revolut, proforma va apărea aici și va fi descărcabilă ca PDF.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {savedProformas.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white font-mono">
                              {item.serie_numar}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              ✓ Achitat Revolut
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(item.data_emiterii).toLocaleDateString('ro-RO')} • {item.descriere_serviciu}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                            <span>Destinatari: {item.transmis_client_email} & {ADMIN_NOTIFICATION_EMAIL}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {item.valoare},00 RON
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Butoane */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Închide
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              Salvează Modificările
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
