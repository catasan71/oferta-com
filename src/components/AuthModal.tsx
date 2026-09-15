import React, { useState } from 'react';
import { X, Lock, Mail, Building, User as UserIcon, ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { User, UserRole } from '../types.ts';
import { initialUser } from '../data/mockData.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'LOGIN' | 'REGISTER';
  onClose: () => void;
  onSuccessLogin: (user: User, orgName?: string, orgCui?: string) => void;
  onOpenLegalModal?: (tab: 'TERMS' | 'GDPR') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'LOGIN',
  onClose,
  onSuccessLogin,
  onOpenLegalModal,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerCompany, setRegisterCompany] = useState('');
  const [registerCui, setRegisterCui] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmail.trim() || 'demo@offerflow.ro';
    const user: User = {
      id: `user-${Date.now()}`,
      organizationId: 'org-1',
      email: email,
      nume: email.split('@')[0] || 'Utilizator OfferFlow',
      rol: 'ADMIN' as UserRole,
      created_at: new Date().toISOString(),
    };
    onSuccessLogin(user);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = registerEmail.trim() || 'utilizator@firma.ro';
    const user: User = {
      id: `user-${Date.now()}`,
      organizationId: 'org-1',
      email: email,
      nume: registerName.trim() || 'Manager Vânzări',
      rol: 'ADMIN' as UserRole,
      created_at: new Date().toISOString(),
    };
    onSuccessLogin(user, registerCompany.trim() || undefined, registerCui.trim() || undefined);
    onClose();
  };

  const handleDemoLogin = () => {
    onSuccessLogin(initialUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Antet Modal */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
              OF
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                OfferFlow <span className="text-xs font-semibold text-blue-500">SaaS B2B</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {mode === 'LOGIN' ? 'Autentifică-te în panoul tău de ofertare' : 'Creează cont gratuit în mai puțin de 1 minut'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector Mod: Login / Register */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setMode('LOGIN')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'LOGIN'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Intră în Cont
            </button>
            <button
              type="button"
              onClick={() => setMode('REGISTER')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'REGISTER'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Creează Cont Gratuit
            </button>
          </div>
        </div>

        {/* Conținut Formular */}
        <div className="p-6">
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email de serviciu
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="exemplu@compania-ta.ro"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Parolă
                  </label>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                    Ai uitat parola?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Autentificare în Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Autentificare Rapidă Demo */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Acces Rapid Demo (1-Click)</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nume și prenume
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Alexandru Popescu"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Companie
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={registerCompany}
                      onChange={(e) => setRegisterCompany(e.target.value)}
                      placeholder="Tech Solutions SRL"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CUI / CIF
                  </label>
                  <input
                    type="text"
                    required
                    value={registerCui}
                    onChange={(e) => setRegisterCui(e.target.value)}
                    placeholder="RO12345678"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email de serviciu
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="alex@techsol.ro"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parolă dorită
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Minim 6 caractere"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  required
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agree-terms" className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Sunt de acord cu{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalModal && onOpenLegalModal('TERMS')}
                    className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700"
                  >
                    Termenii și Condițiile
                  </button>{' '}
                  și{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalModal && onOpenLegalModal('GDPR')}
                    className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700"
                  >
                    Politica GDPR
                  </button>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={!termsAgreed}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>Creează Contul & Intră în Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Info Securitate */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 text-center">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Conexiune criptată SSL • Date găzduite în UE (GDPR)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
