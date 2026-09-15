import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Building2,
  Sparkles,
  Phone,
  Mail,
  FileCheck,
  Check,
  Layers,
  Search,
  Package,
  CheckSquare,
  Square,
  Filter,
  CheckCircle2,
  Tag,
  Wrench,
} from 'lucide-react';
import { Quote, QuoteItem, ProductService, Organization, ItemType, ITEM_TYPE_CONFIGS } from '../types.ts';
import { calculateLineTotal, calculateQuoteTotals, formatCurrency } from '../lib/calculations.ts';

interface QuoteBuilderProps {
  initialQuote?: Quote | null;
  catalog: ProductService[];
  organization: Organization;
  onSaveQuote: (quote: Quote) => void;
  onPreviewQuote: (quote: Quote) => void;
  onCancel: () => void;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  initialQuote,
  catalog,
  organization,
  onSaveQuote,
  onPreviewQuote,
  onCancel,
}) => {
  const [titlu, setTitlu] = useState(initialQuote?.titlu || 'Ofertă Servicii & Soluții Digitale');
  const [numarOferta, setNumarOferta] = useState(
    initialQuote?.numar_oferta || `OF-2026-0${Math.floor(Math.random() * 900 + 100)}`
  );
  const [clientName, setClientName] = useState(initialQuote?.client_name || '');
  const [clientEmail, setClientEmail] = useState(initialQuote?.client_email || '');
  const [clientPhone, setClientPhone] = useState(initialQuote?.client_phone || '');
  const [clientCui, setClientCui] = useState(initialQuote?.client_cui || '');
  const [termeniPlata, setTermeniPlata] = useState(
    initialQuote?.termeni_plata || 'Plată prin transfer bancar conform facturii proforme. Avans 50%, restul la livrare.'
  );
  const [moneda, setMoneda] = useState(initialQuote?.moneda || 'RON');
  const [expiresAt, setExpiresAt] = useState(
    initialQuote?.expires_at?.split('T')[0] ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [items, setItems] = useState<QuoteItem[]>(
    initialQuote?.items || [
      {
        id: `item_${Date.now()}_1`,
        titlu: 'Consultanță și Arhitectură Soluție',
        descriere: 'Analiză cerințe de business, definire specificații tehnice și planificare etape.',
        cantitate: 1,
        pret_unitar: 3500,
        discount_procent: 0,
        total: 3500,
        este_optional: false,
        este_selectat: true,
        tip_articol: 'serviciu',
        um: 'ore',
      },
      {
        id: `item_${Date.now()}_2`,
        titlu: 'Pachet Suport & Mentenanță Lunară',
        descriere: 'Suport tehnic prioritar și actualizări periodice de securitate.',
        cantitate: 1,
        pret_unitar: 1200,
        discount_procent: 10,
        total: 1080,
        este_optional: true,
        este_selectat: true,
        tip_articol: 'abonament',
        um: 'luni',
      },
    ]
  );

  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('TOATE');
  const [catalogType, setCatalogType] = useState<'TOATE' | ItemType>('TOATE');
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([]);

  // Categorii disponibile în catalog
  const catalogCategories = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((item) => {
      if (item.categorie?.trim()) set.add(item.categorie.trim());
    });
    return Array.from(set);
  }, [catalog]);

  // Articole filtrate în picker (doar cele active)
  const filteredCatalogItems = useMemo(() => {
    return catalog.filter((p) => {
      if (p.este_activ === false) return false;
      const matchSearch =
        catalogSearch === '' ||
        p.denumire.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.descriere?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.cod_articol?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.producator?.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchCat = catalogCategory === 'TOATE' || p.categorie === catalogCategory;
      const matchType = catalogType === 'TOATE' || (p.tip_articol || 'produs') === catalogType;
      return matchSearch && matchCat && matchType;
    });
  }, [catalog, catalogSearch, catalogCategory, catalogType]);

  // Recalculare rând
  const handleItemChange = (
    index: number,
    field: keyof QuoteItem,
    value: any
  ) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    
    // Recalculare total linie
    current.total = calculateLineTotal({
      cantitate: current.cantitate,
      pret_unitar: current.pret_unitar,
      discount_procent: current.discount_procent,
    });

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item_${Date.now()}_${items.length + 1}`,
      titlu: '',
      descriere: '',
      cantitate: 1,
      pret_unitar: 0,
      discount_procent: 0,
      total: 0,
      este_optional: false,
      este_selectat: true,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('Oferta trebuie să conțină cel puțin un articol.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddFromCatalog = (product: ProductService) => {
    const newItem: QuoteItem = {
      id: `item_cat_${Date.now()}_${items.length}`,
      titlu: product.denumire,
      descriere: product.descriere || '',
      cantitate: 1,
      pret_unitar: product.pret_unitar,
      discount_procent: 0,
      total: product.pret_unitar,
      este_optional: false,
      este_selectat: true,
      um: product.um,
      cod_articol: product.cod_articol,
      cota_tva: product.cota_tva,
    };
    setItems([...items, newItem]);
    setIsCatalogPickerOpen(false);
  };

  const handleAddSelectedFromCatalog = () => {
    if (selectedCatalogIds.length === 0) return;
    const selectedProducts = catalog.filter((p) => selectedCatalogIds.includes(p.id));
    const newItems: QuoteItem[] = selectedProducts.map((product, idx) => ({
      id: `item_cat_${Date.now()}_${items.length + idx}`,
      titlu: product.denumire,
      descriere: product.descriere || '',
      cantitate: 1,
      pret_unitar: product.pret_unitar,
      discount_procent: 0,
      total: product.pret_unitar,
      este_optional: false,
      este_selectat: true,
      um: product.um,
      cod_articol: product.cod_articol,
      cota_tva: product.cota_tva,
    }));

    setItems([...items, ...newItems]);
    setSelectedCatalogIds([]);
    setIsCatalogPickerOpen(false);
  };

  const toggleSelectCatalogId = (id: string) => {
    setSelectedCatalogIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totals = calculateQuoteTotals(items);

  const buildQuoteObject = (newStatus: Quote['status'] = 'SENT'): Quote => {
    const publicToken = initialQuote?.public_token || `tk-${Math.random().toString(36).substring(2, 12)}`;
    return {
      id: initialQuote?.id || `quote_${Date.now()}`,
      organizationId: organization.id,
      titlu,
      numar_oferta: numarOferta,
      client_name: clientName || 'Client Neconfigurat',
      client_email: clientEmail,
      client_phone: clientPhone,
      client_cui: clientCui,
      valoare_totala: totals.totalGeneral,
      valoare_tva: totals.totalTva,
      moneda,
      status: initialQuote?.status || newStatus,
      public_token: publicToken,
      view_count: initialQuote?.view_count || 0,
      expires_at: new Date(expiresAt).toISOString(),
      termeni_plata: termeniPlata,
      created_at: initialQuote?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization,
      items,
      feedbacks: initialQuote?.feedbacks || [],
      signature: initialQuote?.signature || null,
    };
  };

  const handleSave = (status: Quote['status']) => {
    if (!clientName.trim()) {
      alert('Vă rugăm să introduceți numele clientului.');
      return;
    }
    const quote = buildQuoteObject(status);
    onSaveQuote(quote);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Antet Builder */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              {initialQuote ? 'Editare Ofertă' : 'Creare Ofertă Nouă'}
            </span>
            <span className="text-xs text-slate-400 font-mono">#{numarOferta}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Builder Oferte Comerciale</h2>
          <p className="text-xs text-slate-500">
            Formular dinamic cu articole, opționale, calcul automat TVA și generare link securizat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Anulează
          </button>

          <button
            type="button"
            onClick={() => onPreviewQuote(buildQuoteObject('SENT'))}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            Previzualizează
          </button>

          <button
            type="button"
            onClick={() => handleSave('DRAFT')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            Salvează Ciornă
          </button>

          <button
            type="button"
            onClick={() => handleSave('SENT')}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            Salvează și Generează Link
          </button>
        </div>
      </div>

      {/* Date Principale Ofertă & Date Client */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coloana 1 & 2: Detalii Ofertă */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" /> Date Ofertă
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Titlu Ofertă *</label>
              <input
                type="text"
                value={titlu}
                onChange={(e) => setTitlu(e.target.value)}
                placeholder="ex: Soluție Digitală E-commerce & Notificări"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Număr Ofertă</label>
              <input
                type="text"
                value={numarOferta}
                onChange={(e) => setNumarOferta(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valabilitate Până La</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monedă</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RON">RON (Leu românesc)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dolar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Termeni de Plată & Condiții</label>
            <textarea
              rows={2}
              value={termeniPlata}
              onChange={(e) => setTermeniPlata(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Coloana 3: Date Client (Destinatar) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" /> Beneficiar (Client)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nume Firmă / Client *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="ex: ElectroDistrib Logistics S.A."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">CUI / CIF</label>
            <input
              type="text"
              value={clientCui}
              onChange={(e) => setClientCui(e.target.value)}
              placeholder="ex: RO29481902"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Telefon Contact Client
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="ex: 0740123456"
                className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Client</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="ex: achizitii@electrodistrib.ro"
                className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Articole Ofertă */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Articole & Servicii Ofertate
            </h3>
            <p className="text-xs text-slate-500">Adăugați articole, stabiliți discounturi sau bifați opționale.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCatalogPickerOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Alege din Catalog
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adaugă Rând Nou
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3 w-10 text-center">#</th>
                <th className="pb-3 min-w-[220px]">Denumire & Descriere</th>
                <th className="pb-3 w-20 text-center">Cantitate</th>
                <th className="pb-3 w-28 text-right">Preț Unitar</th>
                <th className="pb-3 w-20 text-center">Disc. %</th>
                <th className="pb-3 w-32 text-right">Total ({moneda})</th>
                <th className="pb-3 w-28 text-center">Opțional?</th>
                <th className="pb-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 text-center text-slate-400 font-mono">{index + 1}</td>
                  <td className="py-3 pr-3 space-y-1">
                    <input
                      type="text"
                      value={item.titlu}
                      onChange={(e) => handleItemChange(index, 'titlu', e.target.value)}
                      placeholder="Denumire produs sau serviciu..."
                      className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <textarea
                      rows={1}
                      value={item.descriere || ''}
                      onChange={(e) => handleItemChange(index, 'descriere', e.target.value)}
                      placeholder="Descriere detaliată a lucrărilor sau livrabilelor..."
                      className="w-full px-2.5 py-1 text-[11px] text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-1 text-center">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={item.cantitate}
                      onChange={(e) => handleItemChange(index, 'cantitate', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1.5 text-xs text-center font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-1 text-right">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.pret_unitar}
                      onChange={(e) => handleItemChange(index, 'pret_unitar', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1.5 text-xs text-right font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-1 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount_procent}
                      onChange={(e) => handleItemChange(index, 'discount_procent', parseFloat(e.target.value) || 0)}
                      className="w-14 px-2 py-1.5 text-xs text-center font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900 text-sm">
                    {formatCurrency(item.total, moneda)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <label className="inline-flex items-center cursor-pointer gap-1.5 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={item.este_optional}
                        onChange={(e) => handleItemChange(index, 'este_optional', e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Opțional</span>
                    </label>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Șterge rând"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sumar Financiar & Recalculare */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="text-xs text-slate-500 space-y-1">
            <p>• Cota TVA standard aplicată: <strong>19%</strong></p>
            <p>• Articolele marcate ca opționale sunt incluse implicit la salvare, dar clientul le poate debifa online.</p>
          </div>

          <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Net:</span>
              <span className="font-mono font-semibold">{formatCurrency(totals.subtotal, moneda)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Total:</span>
                <span className="font-mono font-semibold">-{formatCurrency(totals.totalDiscount, moneda)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>TVA (19%):</span>
              <span className="font-mono font-semibold">{formatCurrency(totals.totalTva, moneda)}</span>
            </div>
            <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-sm">Total Ofertă:</span>
              <span className="text-lg font-mono text-blue-600">{formatCurrency(totals.totalGeneral, moneda)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Alegere din Catalog */}
      {isCatalogPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Selectează din Catalogul de Articole</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCatalogPickerOpen(false);
                  setSelectedCatalogIds([]);
                }}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Căutare & Filtrare în Catalog */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Caută în catalog după denumire, SKU sau specificații..."
                  className="w-full outline-none text-slate-800 placeholder:text-slate-400"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Categorii Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setCatalogCategory('TOATE')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    catalogCategory === 'TOATE'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Toate ({catalog.length})
                </button>
                {catalogCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      catalogCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Listă Articole Filtrate */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {filteredCatalogItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Niciun articol nu corespunde căutării.
                </div>
              ) : (
                filteredCatalogItems.map((prod) => {
                  const isChecked = selectedCatalogIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectCatalogId(prod.id)}
                          className="mt-0.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {prod.categorie || 'General'}
                            </span>
                            {prod.cod_articol && (
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                {prod.cod_articol}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 mt-1">{prod.denumire}</h4>
                          {prod.descriere && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {prod.descriere}
                            </p>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            UM: {prod.um} • TVA: {prod.cota_tva}%
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold font-mono text-xs text-blue-600">
                          {formatCurrency(prod.pret_unitar, prod.moneda)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddFromCatalog(prod)}
                          className="mt-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                        >
                          + Adaugă
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal cu Adăugare Multiplă */}
            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                {selectedCatalogIds.length > 0 ? (
                  <strong className="text-blue-700">{selectedCatalogIds.length} articole selectate</strong>
                ) : (
                  'Bifează căsuțele pentru a adăuga mai multe articole deodată'
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCatalogPickerOpen(false);
                    setSelectedCatalogIds([]);
                  }}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  disabled={selectedCatalogIds.length === 0}
                  onClick={handleAddSelectedFromCatalog}
                  className={`px-4 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCatalogIds.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adaugă {selectedCatalogIds.length > 0 ? `(${selectedCatalogIds.length})` : ''} în Ofertă
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
