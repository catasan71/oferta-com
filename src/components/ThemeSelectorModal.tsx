import React from 'react';
import { Palette, Check, Sparkles, X, Sun, Moon, Coffee, Shield } from 'lucide-react';
import { DashboardTheme } from '../types.ts';
import { THEME_OPTIONS } from '../lib/themes.ts';

interface ThemeSelectorModalProps {
  currentTheme: DashboardTheme;
  onSelectTheme: (theme: DashboardTheme) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  currentTheme,
  onSelectTheme,
  onClose,
}) => {
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Personalizare Fundal & Teme Dashboard
              </h3>
              <p className="text-xs text-slate-500">
                Alegeți o culoare odihnitoare pentru ecran. Schimbarea se aplică instantaneu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de opțiuni de teme */}
        <div className="space-y-3">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = currentTheme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectTheme(opt.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                {/* Mostră vizuală de culoare */}
                <div
                  className="w-12 h-12 rounded-xl shrink-0 border flex items-center justify-center shadow-xs relative overflow-hidden"
                  style={{
                    backgroundColor: opt.swatchBg,
                    borderColor: opt.swatchBorder,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md"
                    style={{ backgroundColor: opt.swatchAccent }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        {getThemeIcon(opt.id)} {opt.label}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {opt.tag}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Activ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Preferința este salvată automat în browser.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Gata / Salvează
          </button>
        </div>
      </div>
    </div>
  );
};
