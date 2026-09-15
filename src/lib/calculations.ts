import { QuoteItem, QuoteCalculationResult } from '../types.ts';

/**
 * Calculează totalul per linie:
 * Linie = Cantitate * Pret_Unitar * (1 - Discount / 100)
 */
export function calculateLineTotal(item: Pick<QuoteItem, 'cantitate' | 'pret_unitar' | 'discount_procent'>): number {
  const qty = Number(item.cantitate) || 0;
  const price = Number(item.pret_unitar) || 0;
  const discount = Math.min(Math.max(Number(item.discount_procent) || 0, 0), 100);
  
  const base = qty * price;
  const discounted = base * (1 - discount / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Calculează totalurile ofertei (Subtotal, Reduceri, TVA, Total General).
 * Ține cont de articolele opționale (se includ doar dacă este_selectat este true).
 */
export function calculateQuoteTotals(items: QuoteItem[], cotaTvaDefault: number = 19): QuoteCalculationResult {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTva = 0;
  let totalGeneral = 0;
  let totalOptionalNeinclus = 0;

  for (const item of items) {
    const qty = Number(item.cantitate) || 0;
    const price = Number(item.pret_unitar) || 0;
    const discount = Math.min(Math.max(Number(item.discount_procent) || 0, 0), 100);
    const lineTotal = calculateLineTotal(item);

    const grossBeforeDiscount = qty * price;
    const discountValue = grossBeforeDiscount - lineTotal;

    if (item.este_optional && !item.este_selectat) {
      // Articol opțional care nu a fost bifat de client
      totalOptionalNeinclus += lineTotal;
      continue;
    }

    subtotal += lineTotal;
    totalDiscount += discountValue;

    // Calcul TVA (19% standard dacă nu este specificat pe item)
    const vatRate = cotaTvaDefault / 100;
    const vatForLine = lineTotal * vatRate;
    totalTva += vatForLine;
  }

  totalGeneral = subtotal + totalTva;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    totalTva: Math.round(totalTva * 100) / 100,
    totalGeneral: Math.round(totalGeneral * 100) / 100,
    totalOptionalNeinclus: Math.round(totalOptionalNeinclus * 100) / 100,
  };
}

/**
 * Formatează numerele în format monetar românesc (ex: 12.450,00 RON)
 */
export function formatCurrency(amount: number, currency: string = 'RON'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: currency || 'RON',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Formatează data în limba română (ex: 14 septembrie 2026)
 */
export function formatDate(isoString?: string): string {
  if (!isoString) return 'Fără termen';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
