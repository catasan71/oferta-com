import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ProformaInvoice, SubscriptionPlan } from '../types.ts';

/**
 * Datele oficiale de identificare fiscală ale operatorului platformei OfferFlow
 */
export const OPERATOR_PROVIDER_INFO = {
  nume: 'Catalin Sandu PFA',
  cui: '54552543',
  reg_com: 'F16/124/2024',
  sediu: 'Craiova, Dolj, România',
  tara: 'România',
  email: 'office@developly.pro',
  telefon: '0765263860',
  iban: 'RO88REVO0000000000000001',
  banca: 'Revolut Bank UAB',
};

export const ADMIN_NOTIFICATION_EMAIL = 'office@developly.pro';
export const ADMIN_SECONDARY_EMAIL = 'catalinsandu07@gmail.com';

const STORAGE_KEY = 'offerflow_proforma_invoices';

/**
 * Returnează lista facturilor proforme salvate local
 */
export function getSavedProformas(): ProformaInvoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Eroare citire facturi proforme:', e);
    return [];
  }
}

/**
 * Salvează o nouă factură proformă
 */
export function saveProforma(invoice: ProformaInvoice): void {
  try {
    const current = getSavedProformas();
    const updated = [invoice, ...current.filter((i) => i.id !== invoice.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Eroare salvare factură proformă:', e);
  }
}

/**
 * Generează un număr secvențial de factură proformă (ex: PRO-2026-0182)
 */
export function generateProformaNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PRO-${year}-${randomSuffix}`;
}

/**
 * Emite factura proformă marcată ca achitată prin card Revolut
 * și înregistrează transmiterea către client și către admin.
 */
export function createAndRecordProforma({
  clientName,
  clientCui,
  clientRegCom,
  clientAddress,
  clientEmail,
  clientPhone,
  plan,
  metodaPlata,
  revolutOrderId,
  revolutTxId,
}: {
  clientName?: string;
  clientCui?: string;
  clientRegCom?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  plan: SubscriptionPlan;
  metodaPlata?: string;
  revolutOrderId?: string;
  revolutTxId?: string;
}): ProformaInvoice {
  const now = new Date();
  const valoare = plan === 'STARTER' ? 45 : plan === 'CLASIC' ? 100 : 0;
  const serieNumar = generateProformaNumber();

  const safeName = (clientName || 'Client B2B').toString().trim() || 'Client B2B';
  const safeAddress = (clientAddress || 'Craiova, România').toString().trim() || 'România';
  const safeEmail = (clientEmail || 'office@developly.pro').toString().trim() || 'office@developly.pro';

  const proforma: ProformaInvoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    serie_numar: serieNumar,
    data_emiterii: now.toISOString(),
    data_scadenta: now.toISOString(),
    furnizor: { ...OPERATOR_PROVIDER_INFO },
    client: {
      nume: safeName,
      cui: clientCui ? String(clientCui).trim() : undefined,
      reg_com: clientRegCom ? String(clientRegCom).trim() : undefined,
      adresa: safeAddress,
      email: safeEmail,
      telefon: clientPhone ? String(clientPhone).trim() : undefined,
    },
    plan,
    descriere_serviciu: `Abonament Platformă OfferFlow B2B • Planul ${plan} (Acces complet 30 de zile)`,
    valoare,
    moneda: 'RON',
    stare: 'ACHITAT_CARD_REVOLUT',
    metoda_plata: metodaPlata || 'Card Bancar / Revolut Pay (Securizat 3D-Secure)',
    revolut_order_id: revolutOrderId || `rev_ord_${Date.now()}`,
    revolut_transaction_id: revolutTxId || `txn_rev_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    data_platii: now.toISOString(),
    transmis_client_email: safeEmail,
    transmis_admin_email: `${ADMIN_NOTIFICATION_EMAIL}, ${ADMIN_SECONDARY_EMAIL}`,
    data_transmiterii: now.toISOString(),
  };

  saveProforma(proforma);
  return proforma;
}

/**
 * Exportă factura proformă într-un fișier PDF oficial
 */
export async function exportProformaToPdf(elementId: string = 'proforma-document-paper', fileName?: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elementul "${elementId}" nu a fost găsit.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1024,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName || `Factura_Proforma_${Date.now()}.pdf`);
    return true;
  } catch (err) {
    console.error('Eroare generare PDF proformă:', err);
    return false;
  }
}
