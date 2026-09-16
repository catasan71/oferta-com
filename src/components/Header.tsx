import React from 'react';
import {
  FileText,
  Zap,
  Package,
  Settings,
  Sparkles,
  Palette,
  LogOut,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { Organization, SubscriptionPlan, DashboardTheme, User } from '../types.ts';
import { getThemeClasses } from '../lib/themes.ts';

interface HeaderProps {
  organization: Organization;
  currentPlan: SubscriptionPlan;
  currentTheme: DashboardTheme;
  currentUser?: User | null;
  activeTab: 'QUOTES' | 'CATALOG';
  onChangeTab: (tab: 'QUOTES' | 'CATALOG') => void;
  onOpenSettings: () => void;
  onOpenThemeSelector?: () => void;
  onOpenRevolutCheckout: () => void;
  onTogglePlan: () => void;
  onViewLanding?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  organization,
  currentPlan,
  currentTheme,
  currentUser,
  activeTab,
  onChangeTab,
  onOpenSettings,
  onOpenThemeSelector,
  onOpenRevolutCheckout,
  onTogglePlan,
  onViewLanding,
  onLogout,
}) => {
  const themeStyles = getThemeClasses(currentTheme);
  const isDarkHeader = currentTheme === 'dark' || currentTheme === 'navy' || currentTheme === 'slate' || currentTheme === 'warm';

  // Specific text colors based on header background
  const headerTextTitle = isDarkHeader ? 'text-white' : 'text-slate-900';
  const headerTextSubtitle = currentTheme === 'warm' ? 'text-amber-200/70' : isDarkHeader ? 'text-slate-400' : 'text-slate-500';
  const headerNavBorder = currentTheme === 'warm' ? 'border-[#3d352e]' : isDarkHeader ? 'border-slate-800' : 'border-slate-200';

  return (
    <header className={`${themeStyles.header} border-b sticky top-0 z-30 print:hidden transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Info Org */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-base font-extrabold tracking-tight flex items-center gap-1.5 ${headerTextTitle}`}>
                  OfferFlow <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    currentTheme === 'warm'
                      ? 'text-amber-300 bg-amber-400/10 border-amber-400/30'
                      : 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                  }`}>SaaS B2B</span>
                </span>
                <p className={`text-[11px] hidden sm:block ${headerTextSubtitle}`}>
                  Platformă de Ofertare & Semnare Digitală
                </p>
              </div>
            </div>

            {/* Navigare Tab-uri */}
            <nav className={`hidden md:flex items-center gap-1 ml-4 pl-4 border-l ${headerNavBorder}`}>
              <button
                type="button"
                onClick={() => onChangeTab('QUOTES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'QUOTES'
                    ? themeStyles.tabActive
                    : themeStyles.tabInactive
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Oferte Comerciale
              </button>
              <button
                type="button"
                onClick={() => onChangeTab('CATALOG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'CATALOG'
                    ? themeStyles.tabActive
                    : themeStyles.tabInactive
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Catalog Articole
              </button>
            </nav>
          </div>

          {/* Dreapta: Plan, Revolut, Setări & Home */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicator Plan & Comutator Test */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onTogglePlan}
                title="Comută rapid între FREE și STARTER pentru a testa branding-ul și comportamentul"
                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  currentPlan === 'STARTER'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40 hover:bg-indigo-500/30'
                    : currentTheme === 'warm'
                    ? 'bg-[#3d352e] text-amber-200 border-[#53473e] hover:bg-[#4a4037]'
                    : isDarkHeader
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{currentPlan === 'CLASIC' ? 'Plan CLASIC' : currentPlan === 'STARTER' ? 'Plan STARTER' : 'Plan FREE'}</span>
              </button>

              {currentPlan === 'FREE' ? (
                <button
                  type="button"
                  onClick={onOpenRevolutCheckout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plată Revolut</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenRevolutCheckout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Abonament Activ • Deschide Plăți & Proforme"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Abonamente</span>
                </button>
              )}
            </div>

            {/* Buton Setări Companie & Culori */}
            <button
              type="button"
              onClick={onOpenSettings}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTheme === 'warm'
                  ? 'text-amber-100 hover:text-white bg-[#3d352e] hover:bg-[#4a4037] border-[#53473e]'
                  : isDarkHeader
                  ? 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border-slate-700'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
              title="Setări Companie, Teme & Culori"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline text-xs font-bold">Setări</span>
            </button>

            {/* Buton Home (fost Landing Page) */}
            {onViewLanding && (
              <button
                type="button"
                onClick={onViewLanding}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  currentTheme === 'warm'
                    ? 'text-amber-200 hover:text-white bg-[#3d352e] hover:bg-[#4a4037] border-[#53473e]'
                    : isDarkHeader
                    ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
                title="Mergi la pagina principală (Home)"
              >
                <Home className="w-3.5 h-3.5 text-blue-400" />
                <span>Home</span>
              </button>
            )}

            {/* Buton Deconectare */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className={`p-2 rounded-xl border text-red-500 hover:text-red-400 hover:bg-red-500/10 border-transparent transition-colors cursor-pointer`}
                title="Deconectare din cont"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
