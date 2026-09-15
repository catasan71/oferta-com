import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Copy,
  Sparkles,
  Package,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  LayoutGrid,
  List,
  Tag,
  Clock,
  TrendingUp,
  CheckCircle2,
  X,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Wrench,
  Boxes,
  CalendarClock,
  Building2,
} from 'lucide-react';
import { ProductService, DashboardTheme, ItemType, ITEM_TYPE_CONFIGS, STANDARD_UNITS_OF_MEASURE } from '../types.ts';
import { formatCurrency } from '../lib/calculations.ts';
import { getThemeClasses } from '../lib/themes.ts';
import { initialCatalog } from '../data/mockData.ts';

interface CatalogManagerProps {
  catalog: ProductService[];
  currentTheme?: DashboardTheme;
  onAddProduct: (product: ProductService) => void;
  onUpdateProduct: (product: ProductService) => void;
  onDeleteProduct: (productId: string) => void;
  onBatchUpdateCatalog?: (products: ProductService[]) => void;
  organizationId: string;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  catalog,
  currentTheme = 'slate',
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBatchUpdateCatalog,
  organizationId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'TOATE' | ItemType>('TOATE');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOATE');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('TOATE');
  const [selectedStatus, setSelectedStatus] = useState<'TOATE' | 'ACTIV' | 'INACTIV'>('TOATE');
  const [sortBy, setSortBy] = useState<'recent' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'margin_desc'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Dialog & Stări Formular
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductService | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductService | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Câmpuri formular pe noua structură completă
  const [tipArticol, setTipArticol] = useState<ItemType>('produs');
  const [codArticol, setCodArticol] = useState('');
  const [producator, setProducator] = useState('');
  const [categorie, setCategorie] = useState('Instalații Sanitare');
  const [customCategorie, setCustomCategorie] = useState('');
  const [denumire, setDenumire] = useState('');
  const [descriere, setDescriere] = useState('');
  const [pretUnitar, setPretUnitar] = useState<number>(1000);
  const [pretCost, setPretCost] = useState<number>(0);
  const [um, setUm] = useState('buc');
  const [cotaTva, setCotaTva] = useState<number>(19);
  const [moneda, setMoneda] = useState('RON');
  const [termenLivrare, setTermenLivrare] = useState('');
  const [esteActiv, setEsteActiv] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeStyles = getThemeClasses(currentTheme);
  const isDark = currentTheme === 'dark' || currentTheme === 'navy';

  // Notificare scurtă
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Extragere categorii unice
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((item) => {
      if (item.categorie && item.categorie.trim()) {
        set.add(item.categorie.trim());
      }
    });
    return Array.from(set);
  }, [catalog]);

  // Deschidere modal adăugare nou
  const handleOpenNew = () => {
    setEditingProduct(null);
    setTipArticol('produs');
    setCodArticol(`ART-${Math.floor(100 + Math.random() * 900)}`);
    setProducator('');
    setCategorie(existingCategories[0] || 'Instalații Sanitare');
    setCustomCategorie('');
    setDenumire('');
    setDescriere('');
    setPretUnitar(350);
    setPretCost(200);
    setUm('buc');
    setCotaTva(19);
    setMoneda('RON');
    setTermenLivrare('1-2 zile lucrătoare');
    setEsteActiv(true);
    setIsFormOpen(true);
  };

  // Deschidere modal editare
  const handleOpenEdit = (p: ProductService) => {
    setEditingProduct(p);
    setTipArticol(p.tip_articol || 'produs');
    setCodArticol(p.cod_articol || '');
    setProducator(p.producator || '');
    setDenumire(p.denumire);
    if (existingCategories.includes(p.categorie || '')) {
      setCategorie(p.categorie || '');
      setCustomCategorie('');
    } else {
      setCategorie('ALTA');
      setCustomCategorie(p.categorie || '');
    }
    setDescriere(p.descriere || '');
    setPretUnitar(p.pret_unitar);
    setPretCost(p.pret_cost || 0);
    setUm(p.um || 'buc');
    setCotaTva(p.cota_tva ?? 19);
    setMoneda(p.moneda);
    setTermenLivrare(p.termen_livrare || '');
    setEsteActiv(p.este_activ ?? true);
    setIsFormOpen(true);
  };

  // Duplicare articol
  const handleDuplicate = (p: ProductService) => {
    const duplicated: ProductService = {
      ...p,
      id: `prod_${Date.now()}`,
      tip_articol: p.tip_articol || 'produs',
      producator: p.producator,
      cod_articol: p.cod_articol ? `${p.cod_articol}-COPY` : `ART-${Math.floor(100 + Math.random() * 900)}`,
      denumire: `${p.denumire} (Copie)`,
      created_at: new Date().toISOString(),
    };
    onAddProduct(duplicated);
    showToast(`Articolul "${duplicated.denumire}" a fost duplicat cu succes!`);
  };

  // Salvare formular
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!denumire.trim()) return;

    const finalCategory = categorie === 'ALTA' ? customCategorie.trim() || 'Diverse' : categorie;

    if (editingProduct) {
      const updated: ProductService = {
        ...editingProduct,
        tip_articol: tipArticol,
        producator: producator.trim() || undefined,
        denumire: denumire.trim(),
        cod_articol: codArticol.trim(),
        categorie: finalCategory,
        descriere: descriere.trim(),
        pret_unitar: pretUnitar,
        pret_cost: pretCost > 0 ? pretCost : undefined,
        um: um.trim(),
        cota_tva: cotaTva,
        moneda,
        termen_livrare: termenLivrare.trim() || undefined,
        este_activ: esteActiv,
        updated_at: new Date().toISOString(),
      };
      onUpdateProduct(updated);
      showToast(`Articolul "${updated.denumire}" a fost actualizat.`);
    } else {
      const newProd: ProductService = {
        id: `prod_${Date.now()}`,
        organizationId,
        tip_articol: tipArticol,
        producator: producator.trim() || undefined,
        denumire: denumire.trim(),
        cod_articol: codArticol.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        categorie: finalCategory,
        descriere: descriere.trim(),
        pret_unitar: pretUnitar,
        pret_cost: pretCost > 0 ? pretCost : undefined,
        um: um.trim() || 'buc',
        cota_tva: cotaTva,
        moneda,
        termen_livrare: termenLivrare.trim() || undefined,
        este_activ: esteActiv,
        created_at: new Date().toISOString(),
      };
      onAddProduct(newProd);
      showToast(`Articolul nou "${newProd.denumire}" a fost adăugat în catalog.`);
    }

    setIsFormOpen(false);
  };

  // Confirmare ștergere
  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      showToast(`Articolul "${productToDelete.denumire}" a fost șters din catalog.`);
      setProductToDelete(null);
    }
  };

  // Încarcă template-uri standard
  const handleLoadTemplates = () => {
    if (onBatchUpdateCatalog) {
      // Evităm duplicatele prin ID
      const existingIds = new Set(catalog.map((p) => p.id));
      const toAdd = initialCatalog.filter((p) => !existingIds.has(p.id));
      if (toAdd.length === 0) {
        showToast('Toate articolele standard există deja în catalog.');
        return;
      }
      onBatchUpdateCatalog([...catalog, ...toAdd]);
      showToast(`Au fost adăugate ${toAdd.length} articole din șabloanele standard!`);
    } else {
      initialCatalog.forEach((p) => onAddProduct(p));
      showToast('Șabloanele standard au fost adăugate în catalog.');
    }
  };

  // Reîncărcare / Resetare completă catalog cu toate cele 7 servicii pe structura nouă
  const handleResetToStandardCatalog = () => {
    if (window.confirm('Sigur doriți să resetați catalogul la șabloanele standard complete cu toate atributele extinse (SKU, Categorie, Marje, TVA, Termene, Status)?')) {
      if (onBatchUpdateCatalog) {
        onBatchUpdateCatalog(initialCatalog);
      } else {
        initialCatalog.forEach((p) => onAddProduct(p));
      }
      showToast('Catalogul a fost reinițializat cu structura completă standard!');
    }
  };

  // Comutare rapidă Status Activ / Inactiv
  const handleToggleStatus = (prod: ProductService) => {
    const updated: ProductService = {
      ...prod,
      este_activ: prod.este_activ === false ? true : false,
      updated_at: new Date().toISOString(),
    };
    onUpdateProduct(updated);
    showToast(
      updated.este_activ
        ? `Articolul "${prod.denumire}" este acum Activ.`
        : `Articolul "${prod.denumire}" a fost marcat ca Inactiv.`
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Cod Articol', 'Denumire', 'Categorie', 'Descriere', 'Pret Unitar', 'Pret Cost', 'UM', 'Cota TVA', 'Moneda', 'Termen Livrare', 'Status'];
    const rows = catalog.map((p) => [
      `"${(p.cod_articol || '').replace(/"/g, '""')}"`,
      `"${p.denumire.replace(/"/g, '""')}"`,
      `"${(p.categorie || '').replace(/"/g, '""')}"`,
      `"${(p.descriere || '').replace(/"/g, '""')}"`,
      p.pret_unitar,
      p.pret_cost || '',
      `"${p.um.replace(/"/g, '""')}"`,
      p.cota_tva,
      `"${p.moneda}"`,
      `"${(p.termen_livrare || '').replace(/"/g, '""')}"`,
      p.este_activ !== false ? 'Activ' : 'Inactiv',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Catalog_Articole_OfferFlow_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Catalogul a fost descărcat în format CSV (compatibil Excel).');
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(catalog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Catalog_Articole_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Fișierul JSON a fost descărcat.');
  };

  // Import fișier CSV / JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const validItems: ProductService[] = parsed.map((item, index) => ({
              id: item.id || `prod_imp_${Date.now()}_${index}`,
              organizationId: organizationId,
              cod_articol: item.cod_articol || `SKU-${index + 1}`,
              categorie: item.categorie || 'Importate',
              denumire: item.denumire || 'Articol fără nume',
              descriere: item.descriere || '',
              pret_unitar: Number(item.pret_unitar) || 0,
              pret_cost: item.pret_cost ? Number(item.pret_cost) : undefined,
              um: item.um || 'buc',
              cota_tva: Number(item.cota_tva) || 19,
              moneda: item.moneda || 'RON',
              termen_livrare: item.termen_livrare,
              este_activ: item.este_activ !== false,
              created_at: item.created_at || new Date().toISOString(),
            }));

            if (onBatchUpdateCatalog) {
              onBatchUpdateCatalog([...catalog, ...validItems]);
            } else {
              validItems.forEach((p) => onAddProduct(p));
            }
            showToast(`Au fost importate cu succes ${validItems.length} articole din JSON!`);
            setIsImportModalOpen(false);
          }
        } else if (file.name.endsWith('.csv')) {
          // Parse simplu CSV
          const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
          if (lines.length <= 1) {
            showToast('Fișierul CSV este gol sau nu conține date.');
            return;
          }
          // Ignorăm header-ul
          const newProducts: ProductService[] = [];
          for (let i = 1; i < lines.length; i++) {
            // regex pentru split pe virgulă dar respectând ghilimelele
            const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
            if (cols.length >= 2) {
              const clean = (val: string) => (val || '').replace(/^"|"$/g, '').replace(/""/g, '"').trim();
              newProducts.push({
                id: `prod_csv_${Date.now()}_${i}`,
                organizationId,
                cod_articol: clean(cols[0]) || `CSV-${i}`,
                denumire: clean(cols[1]) || `Articol CSV ${i}`,
                categorie: clean(cols[2]) || 'Importate CSV',
                descriere: clean(cols[3]) || '',
                pret_unitar: parseFloat(clean(cols[4])) || 100,
                pret_cost: parseFloat(clean(cols[5])) || undefined,
                um: clean(cols[6]) || 'buc',
                cota_tva: parseFloat(clean(cols[7])) || 19,
                moneda: clean(cols[8]) || 'RON',
                termen_livrare: clean(cols[9]) || undefined,
                este_activ: true,
                created_at: new Date().toISOString(),
              });
            }
          }
          if (onBatchUpdateCatalog) {
            onBatchUpdateCatalog([...catalog, ...newProducts]);
          } else {
            newProducts.forEach((p) => onAddProduct(p));
          }
          showToast(`Au fost importate ${newProducts.length} articole din fișierul CSV!`);
          setIsImportModalOpen(false);
        }
      } catch (err) {
        console.error(err);
        showToast('Eroare la parsarea fișierului. Verificați formatul.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Filtrare și sortare
  const filteredAndSorted = useMemo(() => {
    return catalog
      .filter((p) => {
        // Căutare text
        const matchesSearch =
          searchTerm === '' ||
          p.denumire.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.descriere?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.cod_articol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.producator?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtru tip articol
        const matchesType =
          selectedType === 'TOATE' || (p.tip_articol || 'produs') === selectedType;

        // Filtru categorie
        const matchesCategory =
          selectedCategory === 'TOATE' || p.categorie === selectedCategory;

        // Filtru monedă
        const matchesCurrency =
          selectedCurrency === 'TOATE' || p.moneda === selectedCurrency;

        // Filtru status
        const matchesStatus =
          selectedStatus === 'TOATE' ||
          (selectedStatus === 'ACTIV' && p.este_activ !== false) ||
          (selectedStatus === 'INACTIV' && p.este_activ === false);

        return matchesSearch && matchesType && matchesCategory && matchesCurrency && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.denumire.localeCompare(b.denumire);
        if (sortBy === 'name_desc') return b.denumire.localeCompare(a.denumire);
        if (sortBy === 'price_asc') return a.pret_unitar - b.pret_unitar;
        if (sortBy === 'price_desc') return b.pret_unitar - a.pret_unitar;
        if (sortBy === 'margin_desc') {
          const marginA = a.pret_cost ? ((a.pret_unitar - a.pret_cost) / a.pret_unitar) * 100 : 0;
          const marginB = b.pret_cost ? ((b.pret_unitar - b.pret_cost) / b.pret_unitar) * 100 : 0;
          return marginB - marginA;
        }
        // recent
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [catalog, searchTerm, selectedType, selectedCategory, selectedCurrency, selectedStatus, sortBy]);

  // Metrici catalog
  const metrics = useMemo(() => {
    const totalItems = catalog.length;
    const activeItems = catalog.filter((p) => p.este_activ !== false).length;
    const categoriesCount = existingCategories.length;
    const productsCount = catalog.filter((p) => (p.tip_articol || 'produs') === 'produs').length;
    const servicesCount = catalog.filter((p) => p.tip_articol === 'serviciu').length;
    const packagesCount = catalog.filter((p) => p.tip_articol === 'pachet').length;
    const subscriptionsCount = catalog.filter((p) => p.tip_articol === 'abonament').length;
    
    // Medie prețuri în RON
    const itemsRon = catalog.filter((p) => p.moneda === 'RON');
    const avgPriceRon = itemsRon.length > 0 ? itemsRon.reduce((acc, p) => acc + p.pret_unitar, 0) / itemsRon.length : 0;
    
    // Marjă medie
    const itemsWithCost = catalog.filter((p) => p.pret_cost && p.pret_cost > 0);
    const avgMargin =
      itemsWithCost.length > 0
        ? itemsWithCost.reduce((acc, p) => acc + (((p.pret_unitar - (p.pret_cost || 0)) / p.pret_unitar) * 100), 0) / itemsWithCost.length
        : 0;

    return { totalItems, activeItems, categoriesCount, productsCount, servicesCount, packagesCount, subscriptionsCount, avgPriceRon, avgMargin };
  }, [catalog, existingCategories]);

  // Calcul marjă formular live
  const formMarginPercent = useMemo(() => {
    if (pretUnitar > 0 && pretCost > 0 && pretUnitar >= pretCost) {
      return Math.round(((pretUnitar - pretCost) / pretUnitar) * 100);
    }
    return 0;
  }, [pretUnitar, pretCost]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notificare */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2 duration-150 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Catalog & Acțiuni Globale */}
      <div className={`${themeStyles.card} p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-extrabold tracking-tight ${themeStyles.textPrimary}`}>
                Catalog Articole & Servicii
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {catalog.length} articole
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${themeStyles.textSecondary}`}>
              Baza ta de date centralizată cu produse, servicii, prețuri de catalog, cote TVA și marje de profit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Buton Reîncărcare Șabloane Complete */}
          <button
            type="button"
            onClick={handleResetToStandardCatalog}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title="Reinițializează catalogul complet cu toate cele 7 servicii pe structura extinsă"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Șabloane Standard</span>
          </button>

          {/* Buton Import / Export */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Import / Export</span>
          </button>

          {/* Buton Adaugă Articol */}
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă Articol</span>
          </button>
        </div>
      </div>

      {/* Bară KPI & Metrici Rapide pe Noua Structură de Catalog */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`${themeStyles.card} p-4 rounded-2xl border`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>
              Total Articole
            </span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${themeStyles.textPrimary}`}>
              {metrics.totalItems}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              ({metrics.activeItems} active)
            </span>
          </div>
        </div>

        <div className={`${themeStyles.card} p-4 rounded-2xl border`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>
              Produse & Materiale
            </span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${themeStyles.textPrimary}`}>
              {metrics.productsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              piese/echipamente
            </span>
          </div>
        </div>

        <div className={`${themeStyles.card} p-4 rounded-2xl border`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>
              Manoperă & Montaj
            </span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${themeStyles.textPrimary}`}>
              {metrics.servicesCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              servicii / instalare
            </span>
          </div>
        </div>

        <div className={`${themeStyles.card} p-4 rounded-2xl border`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>
              Pachete & Abonamente
            </span>
            <Boxes className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${themeStyles.textPrimary}`}>
              {metrics.packagesCount + metrics.subscriptionsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              ({metrics.packagesCount} pachet, {metrics.subscriptionsCount} ab.)
            </span>
          </div>
        </div>
      </div>

      {/* Bară Instrumente: Căutare, Filtrare Tip & Categorie, Sortare, Mod Afișare */}
      <div className={`${themeStyles.card} p-4 rounded-2xl border space-y-3`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Căutare */}
          <div className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl border ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după denumire, brand/producător (ex: Grohe, Bosch), cod SKU sau categorie..."
              className={`w-full text-xs outline-none bg-transparent ${themeStyles.textPrimary}`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controale dreapta: Monedă, Sortare, Comutator Vizualizare */}
          <div className="flex items-center gap-2">
            {/* Filtru Monedă */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className={`px-3 py-2 text-xs rounded-xl border outline-none font-medium cursor-pointer ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="TOATE">Toate Monedele</option>
              <option value="RON">RON</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>

            {/* Filtru Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className={`px-3 py-2 text-xs rounded-xl border outline-none font-medium cursor-pointer ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="TOATE">Toate Statusurile</option>
              <option value="ACTIV">Doar Active</option>
              <option value="INACTIV">Doar Inactive</option>
            </select>

            {/* Sortare */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 py-2 text-xs rounded-xl border outline-none font-medium cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="recent">Recente</option>
                <option value="name_asc">Nume (A - Z)</option>
                <option value="name_desc">Nume (Z - A)</option>
                <option value="price_asc">Preț (Crescător)</option>
                <option value="price_desc">Preț (Descrescător)</option>
                <option value="margin_desc">Marjă Profit %</option>
              </select>
            </div>

            {/* Switch Grid / Table */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Afișare sub formă de Carduri (Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Afișare sub formă de Tabel detaliat"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtru Tip Articol (Tabs principale conform noii clasificări) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100 dark:border-slate-800/80 pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Package className="w-3 h-3 text-blue-500" /> Tip:
          </span>
          <button
            type="button"
            onClick={() => setSelectedType('TOATE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === 'TOATE'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Toate ({catalog.length})
          </button>
          {(['produs', 'serviciu', 'pachet', 'abonament'] as ItemType[]).map((type) => {
            const config = ITEM_TYPE_CONFIGS[type];
            const count = catalog.filter((p) => (p.tip_articol || 'produs') === type).length;
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? `${config.badgeColor} border-current shadow-xs`
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-transparent text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Chips Categorii */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className={`text-[11px] font-semibold text-slate-400 mr-1 shrink-0 flex items-center gap-1`}>
            <Filter className="w-3 h-3" /> Categorie:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('TOATE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'TOATE'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toate ({catalog.length})
          </button>
          {existingCategories.map((cat) => {
            const count = catalog.filter((p) => p.categorie === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Conținut: Grid sau Tabel */}
      {filteredAndSorted.length === 0 ? (
        <div className={`${themeStyles.card} p-12 rounded-2xl border text-center space-y-3`}>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h3 className={`text-sm font-bold ${themeStyles.textPrimary}`}>
            Niciun articol găsit
          </h3>
          <p className={`text-xs max-w-md mx-auto ${themeStyles.textSecondary}`}>
            Nu există niciun produs sau serviciu care să corespundă criteriilor de filtrare ({searchTerm || selectedCategory}).
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('TOATE');
                setSelectedCurrency('TOATE');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 rounded-lg cursor-pointer"
            >
              Resetează Filtrele
            </button>
            <button
              type="button"
              onClick={handleOpenNew}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
            >
              Adaugă Articol Nou
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* VEDERE GRID (Carduri vizuale) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSorted.map((prod) => {
            const hasCost = prod.pret_cost && prod.pret_cost > 0;
            const margin = hasCost ? Math.round(((prod.pret_unitar - (prod.pret_cost || 0)) / prod.pret_unitar) * 100) : null;
            const typeConfig = ITEM_TYPE_CONFIGS[prod.tip_articol || 'produs'];

            return (
              <div
                key={prod.id}
                className={`${themeStyles.card} p-5 rounded-2xl border hover:border-blue-400/80 transition-all flex flex-col justify-between group shadow-xs`}
              >
                <div>
                  {/* Top card: Tip Articol, Categorie, Status & SKU */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${typeConfig.badgeColor}`}>
                        <span>{typeConfig.icon}</span>
                        <span>{typeConfig.label}</span>
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[130px]">
                        {prod.categorie || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(prod)}
                        title={prod.este_activ !== false ? 'Click pentru a dezactiva articolul' : 'Click pentru a activa articolul'}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          prod.este_activ !== false
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-500 border border-slate-400/30 hover:bg-slate-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${prod.este_activ !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {prod.este_activ !== false ? 'Activ' : 'Inactiv'}
                      </button>
                    </div>
                  </div>

                  {/* Brand / Producător & Cod Articol */}
                  <div className="flex items-center gap-2 mb-1.5 text-[11px]">
                    {prod.producator && (
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                        <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                        {prod.producator}
                      </span>
                    )}
                    {prod.cod_articol && (
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        SKU: {prod.cod_articol}
                      </span>
                    )}
                  </div>

                  {/* Denumire */}
                  <h3 className={`font-bold text-sm leading-snug ${themeStyles.textPrimary} group-hover:text-blue-600 transition-colors`}>
                    {prod.denumire}
                  </h3>

                  {/* Descriere */}
                  {prod.descriere && (
                    <p className={`text-xs mt-2 line-clamp-3 leading-relaxed ${themeStyles.textSecondary}`}>
                      {prod.descriere}
                    </p>
                  )}

                  {/* Informații secundare: UM, TVA, Livrare */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      U.M.: <strong className="text-slate-900 dark:text-white">{prod.um}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      TVA: <strong>{prod.cota_tva}%</strong>
                    </span>
                    {prod.termen_livrare && (
                      <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {prod.termen_livrare}
                      </span>
                    )}
                  </div>
                </div>

                {/* Partea de Jos: Prețuri, Marjă & Butoane Acțiuni */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Preț Unitar Vânzare</div>
                    <div className="text-base font-black font-mono text-blue-600">
                      {formatCurrency(prod.pret_unitar, prod.moneda)}
                      <span className="text-xs font-semibold text-slate-400 ml-1">/ {prod.um}</span>
                    </div>
                    {margin !== null && (
                      <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        Marjă: +{margin}%
                      </div>
                    )}
                  </div>

                  {/* Acțiuni */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(prod)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                      title="Duplică articolul (Clone)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(prod)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Editează datele articolului"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(prod)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Șterge din catalog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VEDERE TABEL (Compact List) */
        <div className={`${themeStyles.card} rounded-2xl border overflow-hidden shadow-xs`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} font-semibold uppercase text-[10px] tracking-wider`}>
                <tr>
                  <th className="py-3 px-3 w-28">Tip</th>
                  <th className="py-3 px-3 w-28">Cod SKU</th>
                  <th className="py-3 px-4 min-w-[240px]">Denumire & Brand/Model</th>
                  <th className="py-3 px-3 w-32">Categorie</th>
                  <th className="py-3 px-2 w-16 text-center">U.M.</th>
                  <th className="py-3 px-2 w-16 text-center">TVA</th>
                  <th className="py-3 px-4 w-32 text-right">Preț Vânzare</th>
                  <th className="py-3 px-4 w-28 text-right">Cost / Marjă</th>
                  <th className="py-3 px-3 w-20 text-center">Status</th>
                  <th className="py-3 px-4 w-24 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredAndSorted.map((prod) => {
                  const hasCost = prod.pret_cost && prod.pret_cost > 0;
                  const margin = hasCost ? Math.round(((prod.pret_unitar - (prod.pret_cost || 0)) / prod.pret_unitar) * 100) : null;
                  const typeConfig = ITEM_TYPE_CONFIGS[prod.tip_articol || 'produs'];

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${typeConfig.badgeColor}`}>
                          <span>{typeConfig.icon}</span>
                          <span>{typeConfig.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[11px] text-slate-500">
                        {prod.cod_articol || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-xs ${themeStyles.textPrimary}`}>{prod.denumire}</span>
                          {prod.producator && (
                            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5" />
                              {prod.producator}
                            </span>
                          )}
                        </div>
                        {prod.descriere && (
                          <div className={`text-[11px] line-clamp-1 mt-0.5 ${themeStyles.textSecondary}`}>
                            {prod.descriere}
                          </div>
                        )}
                        {prod.termen_livrare && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {prod.termen_livrare}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {prod.categorie || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700 dark:text-slate-200">
                        {prod.um}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-500">
                        {prod.cota_tva}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 text-xs whitespace-nowrap">
                        {formatCurrency(prod.pret_unitar, prod.moneda)}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">/{prod.um}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px]">
                        {hasCost ? (
                          <div>
                            <span className="text-slate-400">{formatCurrency(prod.pret_cost!, prod.moneda)}</span>
                            {margin !== null && (
                              <div className="text-[10px] font-bold text-emerald-600">+{margin}%</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(prod)}
                          title={prod.este_activ !== false ? 'Click pentru a dezactiva' : 'Click pentru a activa'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            prod.este_activ !== false
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 border border-slate-400/20 hover:bg-slate-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${prod.este_activ !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {prod.este_activ !== false ? 'Activ' : 'Inactiv'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Duplică"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Editează"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Șterge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FORMULAR: Adăugare / Editare Articol */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingProduct ? 'Editare Articol din Catalog' : 'Adăugare Articol Nou în Catalog'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corp Formular */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-100">
              {/* Secțiunea 1: Tip Articol (Clasificare clară) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>Tip Articol (Clasificare Ofertă & Catalog) *</span>
                  <span className="text-[11px] text-slate-400 font-normal">Selectați tipul potrivit</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['produs', 'serviciu', 'pachet', 'abonament'] as ItemType[]).map((type) => {
                    const config = ITEM_TYPE_CONFIGS[type];
                    const isSelected = tipArticol === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setTipArticol(type);
                          // Default sensible U.M. when changing type
                          if (type === 'produs' && (um === 'ore' || um === 'serviciu' || um === 'luni')) setUm('buc');
                          if (type === 'serviciu' && (um === 'buc' || um === 'kg')) setUm('ore');
                          if (type === 'pachet') setUm('kit');
                          if (type === 'abonament') setUm('luni');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{config.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {config.label}
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            {config.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secțiunea 2: Identificare & Brand / Producător */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Identificare & Specificații Tehnice
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Cod Articol / SKU
                      </label>
                      <button
                        type="button"
                        onClick={() => setCodArticol(`SKU-${Math.floor(1000 + Math.random() * 9000)}`)}
                        className="text-[10px] text-blue-600 hover:underline cursor-pointer font-medium"
                      >
                        Generează
                      </button>
                    </div>
                    <input
                      type="text"
                      value={codArticol}
                      onChange={(e) => setCodArticol(e.target.value)}
                      placeholder="ex: SAN-GRH-01"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Producător / Brand / Model
                    </label>
                    <input
                      type="text"
                      value={producator}
                      onChange={(e) => setProducator(e.target.value)}
                      placeholder="ex: Grohe, Bosch, Romstal, Viega"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Categorie / Departament *
                    </label>
                    <select
                      value={categorie}
                      onChange={(e) => setCategorie(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      {existingCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="ALTA">+ Categorie Nouă...</option>
                    </select>
                  </div>
                </div>

                {/* Dacă a ales categorie nouă */}
                {categorie === 'ALTA' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-1">
                      Nume Categorie Nouă
                    </label>
                    <input
                      type="text"
                      value={customCategorie}
                      onChange={(e) => setCustomCategorie(e.target.value)}
                      placeholder="ex: Instalații Solare & Fotovoltaice"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg outline-none"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Rând: Denumire */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Denumire Produs / Lucrare / Serviciu *
                </label>
                <input
                  type="text"
                  value={denumire}
                  onChange={(e) => setDenumire(e.target.value)}
                  placeholder="ex: Baterie lavoar Grohe Eurosmart monocomandă sau Montaj instalație sanitară..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 font-semibold"
                  required
                />
              </div>

              {/* Rând: Descriere */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specificații Tehnice & Descriere Detaliată
                </label>
                <textarea
                  rows={2}
                  value={descriere}
                  onChange={(e) => setDescriere(e.target.value)}
                  placeholder="Specificații tehnice, dimensiuni, diametre, etape de execuție, garanție..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800"
                />
              </div>

              {/* Rând: Date Financiare */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Financiar & Calcule Marjă</span>
                  {formMarginPercent > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      Marjă Estimată: +{formMarginPercent}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Preț Vânzare Unitar *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={pretUnitar}
                      onChange={(e) => setPretUnitar(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Cost Achiziție / Producție
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={pretCost}
                      onChange={(e) => setPretCost(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Monedă
                    </label>
                    <select
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      <option value="RON">RON (Lei)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rând: Unitate de Măsură (U.M.) flexibilă & Cotă TVA & Livrare */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Unitate de Măsură (U.M.) flexibilă
                </label>
                
                {/* Selector rapid U.M. */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STANDARD_UNITS_OF_MEASURE.map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => setUm(unit.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        um === unit.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                      title={unit.label}
                    >
                      {unit.value}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      U.M. Personalizată
                    </label>
                    <input
                      type="text"
                      value={um}
                      onChange={(e) => setUm(e.target.value)}
                      placeholder="buc, ml, mp, kg, kit, ore, etc."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 font-mono font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Cotă TVA
                    </label>
                    <select
                      value={cotaTva}
                      onChange={(e) => setCotaTva(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 cursor-pointer"
                    >
                      <option value={19}>19% (Standard)</option>
                      <option value={9}>9% (Redusă)</option>
                      <option value={5}>5% (Specială)</option>
                      <option value={0}>0% (Scutit / Neimpozabil)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Termen Livrare / Execuție
                    </label>
                    <input
                      type="text"
                      value={termenLivrare}
                      onChange={(e) => setTermenLivrare(e.target.value)}
                      placeholder="ex: 1-2 zile lucrătoare, stoc"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Rând 6: Status Activ / Inactiv */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Disponibilitate în Oferte (Status)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {esteActiv
                      ? 'Articol activ — vizibil și disponibil pentru selectare în oferte comerciale.'
                      : 'Articol inactiv — salvat în catalog dar ascuns din selectorul rapid de oferte.'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={esteActiv}
                    onChange={(e) => setEsteActiv(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Footer Butoane Formular */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  {editingProduct ? 'Salvează Modificările' : 'Adaugă Articol în Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT / EXPORT */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Import & Export Catalog</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-slate-800 dark:text-slate-100">
              {/* Secțiunea Export */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Exportă Catalogul Curent
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all cursor-pointer group"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-1.5" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">
                      Format CSV (Excel)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Compatibil cu Microsoft Excel și Google Sheets
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all cursor-pointer group"
                  >
                    <FileCode className="w-5 h-5 text-blue-600 mb-1.5" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-700">
                      Format JSON
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Backup complet cu toate proprietățile și relațiile
                    </div>
                  </button>
                </div>
              </div>

              {/* Secțiunea Import */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Importă Articole din Fișier
                </h4>
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Încarcă fișier CSV sau JSON
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Articolele din fișier vor fi adăugate automat în catalogul tău.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv,.json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Alege Fișierul de pe Disc
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-right">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 cursor-pointer"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMARE ȘTERGERE */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ștergi articolul din catalog?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ești pe cale să ștergi <strong>"{productToDelete.denumire}"</strong>. Ofertele deja create cu acest articol nu vor fi afectate.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 cursor-pointer"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Da, Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
