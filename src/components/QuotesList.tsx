import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Mail,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  Trash2,
  Edit,
  AlertCircle,
  FileText,
  Share2,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Quote, QuoteStatus, SubscriptionPlan, DashboardTheme } from '../types.ts';
import { formatCurrency, formatDate } from '../lib/calculations.ts';
import { ShareQuoteModal } from './ShareQuoteModal.tsx';
import { getThemeClasses } from '../lib/themes.ts';
import { encodeQuoteToHash } from '../lib/portableLink.ts';

interface QuotesListProps {
  quotes: Quote[];
  subscriptionPlan: SubscriptionPlan;
  currentTheme?: DashboardTheme;
  onSelectQuoteToView: (quote: Quote) => void;
  onSelectQuoteToEdit: (quote: Quote) => void;
  onCreateNewQuote: () => void;
  onDeleteQuote: (quoteId: string) => void;
  onUpgradeToStarter: () => void;
}

export const QuotesList: React.FC<QuotesListProps> = ({
  quotes,
  subscriptionPlan,
  currentTheme = 'slate',
  onSelectQuoteToView,
  onSelectQuoteToEdit,
  onCreateNewQuote,
  onDeleteQuote,
  onUpgradeToStarter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quoteToShare, setQuoteToShare] = useState<Quote | null>(null);

  const themeStyles = getThemeClasses(currentTheme);
  const isDark = currentTheme === 'dark' || currentTheme === 'navy';

  // Verificare limite conform specificațiilor
  const maxQuotesForPlan = subscriptionPlan === 'FREE' ? 2 : subscriptionPlan === 'STARTER' ? 5 : 30;
  const quotesCount = quotes.length;
  const isLimitReached = quotesCount >= maxQuotesForPlan;

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.titlu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.numar_oferta.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || q.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistici rapide
  const totalValue = quotes.reduce((acc, q) => acc + q.valoare_totala, 0);
  const acceptedQuotes = quotes.filter((q) => q.status === 'ACCEPTED');
  const acceptedValue = acceptedQuotes.reduce((acc, q) => acc + q.valoare_totala, 0);
  const conversionRate = quotes.length > 0 ? Math.round((acceptedQuotes.length / quotes.length) * 100) : 0;

  const handleCopyLink = (token: string, quoteId: string) => {
    const targetQuote = quotes.find((q) => q.id === quoteId || q.public_token === token);
    const portableHash = targetQuote ? `#d=${encodeQuoteToHash(targetQuote)}` : '';
    const url = `${window.location.origin}/view/${token}${portableHash}`;
    navigator.clipboard.writeText(url);
    setCopiedId(quoteId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendEmail = (quote: Quote) => {
    const portableHash = `#d=${encodeQuoteToHash(quote)}`;
    const publicUrl = `${window.location.origin}/view/${quote.public_token}${portableHash}`;
    const subject = encodeURIComponent(`Ofertă Comercială ${quote.numar_oferta} - ${quote.titlu}`);
    const body = encodeURIComponent(
      `Bună ziua,\n\nVă transmitem oferta comercială ${quote.numar_oferta} în valoare de ${formatCurrency(quote.valoare_totala, quote.moneda)}.\n\nPuteți vizualiza detaliile complete, selecta opționalele și semna digital direct aici:\n${publicUrl}\n\nCu stimă,\n${quote.organization?.nume || 'Echipa noastră'}`
    );
    const mailto = `mailto:${quote.client_email || ''}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">Ciornă</span>;
      case 'SENT':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Trimisă</span>;
      case 'VIEWED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Vizualizată</span>;
      case 'NEGOTIATION':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">În Negociere</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">Semnată ✓</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">Refuzată</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Indicator Avertisment Limită Plan */}
      {subscriptionPlan !== 'CLASIC' && (
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          isLimitReached ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200' : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 text-blue-900 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isLimitReached ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                Plan {subscriptionPlan}: {quotesCount} din {maxQuotesForPlan} oferte active
              </h4>
              <p className="text-xs opacity-85">
                {isLimitReached
                  ? `Ați atins limita de ${maxQuotesForPlan} oferte pentru planul ${subscriptionPlan}. Faceți upgrade pentru a debloca oferte suplimentare și white-label complet.`
                  : subscriptionPlan === 'FREE'
                  ? 'Planul Free include maxim 2 oferte comerciale. Faceți upgrade la Starter (45 RON) sau Clasic (100 RON) pentru white-label și volum extins.'
                  : 'Planul Starter include 5 oferte comerciale. Puteți trece oricând la Clasic (100 RON) pentru 30 de oferte.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onUpgradeToStarter}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
          >
            Upgrade Plan (Revolut)
          </button>
        </div>
      )}

      {/* Bară Statistici KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`${themeStyles.card} p-4 rounded-2xl border`}>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Oferte</p>
          <div className={`text-2xl font-black mt-1 ${themeStyles.textPrimary}`}>{quotes.length}</div>
          <span className="text-[11px] text-slate-400">create în cont</span>
        </div>

        <div className={`${themeStyles.card} p-4 rounded-2xl border`}>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Valoare Pipeline</p>
          <div className="text-2xl font-black text-blue-500 font-mono mt-1">{formatCurrency(totalValue)}</div>
          <span className="text-[11px] text-slate-400">valoare cumulată</span>
        </div>

        <div className={`${themeStyles.card} p-4 rounded-2xl border`}>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Oferte Semnate</p>
          <div className="text-2xl font-black text-emerald-500 font-mono mt-1">{formatCurrency(acceptedValue)}</div>
          <span className="text-[11px] text-emerald-500 font-semibold">{acceptedQuotes.length} contracte încheiate</span>
        </div>

        <div className={`${themeStyles.card} p-4 rounded-2xl border`}>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rată de Conversie</p>
          <div className="text-2xl font-black text-indigo-500 font-mono mt-1">{conversionRate}%</div>
          <span className="text-[11px] text-slate-400">semnate din total</span>
        </div>
      </div>

      {/* Bară Acțiuni & Filtrare */}
      <div className={`${themeStyles.card} p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Căutare */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după client, număr ofertă sau titlu..."
              className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeStyles.input}`}
            />
          </div>

          {/* Filtru Status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeStyles.input}`}
            >
              <option value="ALL">Toate Statusurile</option>
              <option value="DRAFT">Ciorne</option>
              <option value="SENT">Trimise</option>
              <option value="VIEWED">Vizualizate</option>
              <option value="NEGOTIATION">În Negociere</option>
              <option value="ACCEPTED">Semnate</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={isLimitReached ? onUpgradeToStarter : onCreateNewQuote}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
            isLimitReached
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 active:scale-[0.98]'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]'
          }`}
          title={
            isLimitReached
              ? `Limita de ${maxQuotesForPlan} oferte pentru planul ${subscriptionPlan} a fost atinsă. Click pentru Upgrade Revolut!`
              : 'Creează o ofertă comercială nouă'
          }
        >
          {isLimitReached ? (
            <>
              <Sparkles className="w-4 h-4" />
              Upgrade Plan ({quotesCount}/{maxQuotesForPlan} oferte)
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Ofertă Nouă
            </>
          )}
        </button>
      </div>

      {/* Lista de Oferte */}
      <div className="grid grid-cols-1 gap-3">
        {filteredQuotes.length === 0 ? (
          <div className={`${themeStyles.card} p-12 text-center rounded-2xl border text-slate-400`}>
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className={`font-semibold text-sm ${themeStyles.textPrimary}`}>Nu a fost găsită nicio ofertă</p>
            <p className="text-xs text-slate-400 mt-1">Ajustați filtrele sau creați o ofertă nouă.</p>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className={`${themeStyles.card} p-5 rounded-2xl border hover:border-blue-400 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
            >
              {/* Informații Ofertă */}
              <div className="space-y-1.5 flex-1 min-w-[260px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${themeStyles.badge}`}>
                    {quote.numar_oferta}
                  </span>
                  {getStatusBadge(quote.status)}
                  {quote.view_count > 0 && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" /> {quote.view_count} vizualizări
                    </span>
                  )}
                  {quote.feedbacks && quote.feedbacks.length > 0 && (
                    <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <MessageSquare className="w-3 h-3" /> {quote.feedbacks.length} comentarii
                    </span>
                  )}
                  {quote.signature && (
                    <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> Semnat de {quote.signature.semnatar_nume}
                    </span>
                  )}
                </div>

                <h3 className={`font-bold text-sm hover:text-blue-500 cursor-pointer ${themeStyles.textPrimary}`}
                    onClick={() => onSelectQuoteToView(quote)}>
                  {quote.titlu}
                </h3>

                <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${themeStyles.textSecondary}`}>
                  <span className="font-semibold">{quote.client_name}</span>
                  {quote.client_email && (
                    <span>{quote.client_email}</span>
                  )}
                  <span>Emisă: {formatDate(quote.created_at)}</span>
                  <span>Expiră: {formatDate(quote.expires_at)}</span>
                </div>
              </div>

              {/* Preț Total */}
              <div className="text-left md:text-right shrink-0">
                <div className="text-xs text-slate-400">Valoare Ofertă:</div>
                <div className={`text-lg font-black font-mono ${themeStyles.textPrimary}`}>
                  {formatCurrency(quote.valoare_totala, quote.moneda)}
                </div>
                <div className="text-[10px] text-slate-400">TVA inclus: {formatCurrency(quote.valoare_tva, quote.moneda)}</div>
              </div>

              {/* Bară Butoane Acțiuni */}
              <div className={`flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 ${themeStyles.border} w-full md:w-auto justify-end`}>
                {/* Deschide Mod Client */}
                <button
                  type="button"
                  onClick={() => onSelectQuoteToView(quote)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Vezi exact cum arată oferta pentru client"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  Vezi Ofertă
                </button>

                {/* Buton Trimite Ofertă (deschide dialog complet de partajare cu link, WhatsApp și Email) */}
                <button
                  type="button"
                  onClick={() => setQuoteToShare(quote)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
                  title="Trimite linkul ofertei către client pe WhatsApp, Email sau copiază linkul"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Trimite Ofertă
                </button>

                {/* Copiază Link Public */}
                <button
                  type="button"
                  onClick={() => handleCopyLink(quote.public_token, quote.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Copiază link public securizat"
                >
                  {copiedId === quote.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copiat!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiază Link</span>
                    </>
                  )}
                </button>

                {/* Editare */}
                <button
                  type="button"
                  onClick={() => onSelectQuoteToEdit(quote)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border-slate-700'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                  title="Editează oferta"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                {/* Ștergere */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Sigur doriți să ștergeți oferta ${quote.numar_oferta}?`)) {
                      onDeleteQuote(quote.id);
                    }
                  }}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 border-slate-700'
                      : 'text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border-slate-200'
                  }`}
                  title="Șterge ofertă"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {quoteToShare && (
        <ShareQuoteModal
          quote={quoteToShare}
          onClose={() => setQuoteToShare(null)}
        />
      )}
    </div>
  );
};
