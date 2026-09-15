import { DashboardTheme } from '../types.ts';

export interface ThemeOption {
  id: DashboardTheme;
  label: string;
  description: string;
  tag: string;
  swatchBg: string;
  swatchBorder: string;
  swatchAccent: string;
  swatchText: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'slate',
    label: 'Gri Ardezie (Recomandat)',
    description: 'Fundal gri neutru, odihnitor pentru ochi. Elimină complet albul orbitor păstrând lizibilitatea optimă.',
    tag: 'Echilibrat & Odihnitor',
    swatchBg: '#e9eff5',
    swatchBorder: '#cbd5e1',
    swatchAccent: '#2563eb',
    swatchText: '#0f172a',
  },
  {
    id: 'dark',
    label: 'Mod Întunecat (Dark Obsidian)',
    description: 'Fundal întunecat premium tip aplicație fintech / Linear. Zero lumină albă, ideal pentru lucru relaxat.',
    tag: 'Dark Mode Confortabil',
    swatchBg: '#090d16',
    swatchBorder: '#1e293b',
    swatchAccent: '#38bdf8',
    swatchText: '#f8fafc',
  },
  {
    id: 'warm',
    label: 'Bej Cald (Sand & Paper)',
    description: 'Nuanță caldă de pergament și cafea fină. Oferă o experiență naturală, asemănătoare unei cărți tipărite.',
    tag: 'Cald & Fără Alb',
    swatchBg: '#f4efe6',
    swatchBorder: '#dcd3c3',
    swatchAccent: '#b45309',
    swatchText: '#292524',
  },
  {
    id: 'navy',
    label: 'Bleumarin Regal (Midnight Navy)',
    description: 'Paletă corporate profundă în tonuri de safir și albastru marin închis.',
    tag: 'Corporate & Elegant',
    swatchBg: '#080e1e',
    swatchBorder: '#1c326b',
    swatchAccent: '#60a5fa',
    swatchText: '#f1f5f9',
  },
  {
    id: 'light',
    label: 'Alb Clasic (Minimal)',
    description: 'Varianta inițială foarte luminoasă.',
    tag: 'Luminos',
    swatchBg: '#f8fafc',
    swatchBorder: '#cbd5e1',
    swatchAccent: '#475569',
    swatchText: '#0f172a',
  },
];

export function getThemeClasses(theme?: DashboardTheme | string) {
  const activeTheme = (theme as DashboardTheme) || 'slate';
  switch (activeTheme) {
    case 'dark':
      return {
        bg: 'bg-[#090d16] text-slate-100',
        header: 'bg-[#0f172a] text-white border-slate-800',
        card: 'bg-[#121929] border-slate-800 text-slate-100 shadow-sm',
        cardSecondary: 'bg-[#0e1422] border-slate-800/80 text-slate-300',
        border: 'border-slate-800',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-400',
        input: 'bg-[#0b101c] border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-sky-500',
        tabActive: 'bg-slate-800 text-white',
        tabInactive: 'text-slate-400 hover:text-white hover:bg-slate-800/60',
        badge: 'bg-slate-800 text-slate-200 border-slate-700',
      };
    case 'navy':
      return {
        bg: 'bg-[#080e1e] text-slate-100',
        header: 'bg-[#0e1a38] text-white border-blue-950',
        card: 'bg-[#122045] border-[#1c326b] text-slate-100 shadow-sm',
        cardSecondary: 'bg-[#0d1733] border-[#1c326b] text-slate-300',
        border: 'border-[#1c326b]',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-300',
        input: 'bg-[#0a1329] border-[#1f3775] text-slate-100 placeholder-slate-400 focus:ring-blue-500',
        tabActive: 'bg-[#1e3570] text-white',
        tabInactive: 'text-slate-300 hover:text-white hover:bg-[#162752]',
        badge: 'bg-[#172754] text-blue-200 border-[#1f3775]',
      };
    case 'warm':
      return {
        bg: 'bg-[#f4efe6] text-stone-900',
        header: 'bg-[#2b2520] text-amber-50 border-[#3d352e]',
        card: 'bg-[#fcfaf7] border-[#ddd5c7] text-stone-900 shadow-xs',
        cardSecondary: 'bg-[#f5f0e6] border-[#ddd5c7] text-stone-700',
        border: 'border-[#ddd5c7]',
        textPrimary: 'text-stone-900',
        textSecondary: 'text-stone-600',
        input: 'bg-white border-[#d3c9b8] text-stone-900 placeholder-stone-400 focus:ring-amber-600',
        tabActive: 'bg-[#3d352e] text-amber-50',
        tabInactive: 'text-stone-400 hover:text-amber-100 hover:bg-[#3d352e]/60',
        badge: 'bg-[#ece5d8] text-stone-800 border-[#d6ccbc]',
      };
    case 'slate':
      return {
        bg: 'bg-[#e9eff5] text-slate-900',
        header: 'bg-slate-900 text-white border-slate-800',
        card: 'bg-white border-slate-300/80 text-slate-900 shadow-sm',
        cardSecondary: 'bg-slate-100 border-slate-300 text-slate-700',
        border: 'border-slate-300',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-600',
        input: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500',
        tabActive: 'bg-slate-800 text-white',
        tabInactive: 'text-slate-400 hover:text-white hover:bg-slate-800',
        badge: 'bg-slate-200 text-slate-800 border-slate-300',
      };
    case 'light':
    default:
      return {
        bg: 'bg-slate-50 text-slate-900',
        header: 'bg-white text-slate-900 border-slate-200',
        card: 'bg-white border-slate-200 text-slate-900 shadow-sm',
        cardSecondary: 'bg-slate-50 border-slate-200 text-slate-600',
        border: 'border-slate-200',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-500',
        input: 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500',
        tabActive: 'bg-slate-100 text-slate-900',
        tabInactive: 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}
