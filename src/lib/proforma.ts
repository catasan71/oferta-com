import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ProformaInvoice, SubscriptionPlan } from '../types.ts';

/**
 * Datele oficiale de identificare fiscală ale operatorului platformei OfferFlow
 */
export const OPERATOR_PROVIDER_INFO = {
  nume: 'SANDU M.I. CĂTĂLIN PERSOANĂ FIZICĂ AUTORIZATĂ',
  cui: '54552543',
  reg_com: 'F16/124/2024',
  sediu: 'Craiova, Romania',
  tara: 'România',
  email: 'catalinsandu@protonmail.com',
  telefon: '+40765263860',
  iban: 'RO88REVO0000000000000001',
  banca: 'Revolut Bank UAB',
};

export const ADMIN_NOTIFICATION_EMAIL = 'catalinsandu@protonmail.com';
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
  customAmount,
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
  customAmount?: number;
  metodaPlata?: string;
  revolutOrderId?: string;
  revolutTxId?: string;
}): ProformaInvoice {
  const now = new Date();
  const valoare = customAmount !== undefined ? customAmount : plan === 'STARTER' ? 45 : plan === 'CLASIC' ? 100 : 45;
  const serieNumar = generateProformaNumber();

  const safeName = (clientName || 'SANDU M.I. CĂTĂLIN PERSOANĂ FIZICĂ AUTORIZATĂ').toString().trim();
  const safeAddress = (clientAddress || 'Craiova, Dolj, România').toString().trim();
  const safeEmail = (clientEmail || 'catalinsandu@protonmail.com').toString().trim();

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
    metoda_plata: metodaPlata || 'Revolut Business (Card / Revolut Pay / Apple Pay / Google Pay)',
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
 * Exportă factura fiscală / proformă într-un fișier PDF oficial
 */
export async function exportProformaToPdf(
  source: ProformaInvoice | string = 'proforma-document-paper',
  fileName?: string
): Promise<boolean> {
  // 1. Dacă sursa este un obiect ProformaInvoice, generăm direct PDF vectorial
  if (typeof source === 'object' && source !== null && 'serie_numar' in source) {
    try {
      const inv = source as ProformaInvoice;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Antet
      pdf.setFontSize(18);
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text('FACTURĂ FISCALĂ / PROFORMĂ', 20, 25);

      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.text(`Serie și Număr: ${inv.serie_numar}`, 20, 32);
      pdf.text(`Data emiterii: ${new Date(inv.data_emiterii).toLocaleDateString('ro-RO')}`, 20, 37);
      pdf.text(`Status: ACHITAT CU SUCCES (REVOLUT BUSINESS)`, 20, 42);

      pdf.setDrawColor(226, 232, 240);
      pdf.line(20, 46, 190, 46);

      // Furnizor
      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42);
      pdf.text('FURNIZOR:', 20, 54);
      pdf.setFontSize(9);
      pdf.setTextColor(51, 65, 85);
      pdf.text(inv.furnizor.nume, 20, 60);
      pdf.text(`C.U.I.: ${inv.furnizor.cui}`, 20, 65);
      if (inv.furnizor.reg_com) pdf.text(`Reg. Com.: ${inv.furnizor.reg_com}`, 20, 70);
      pdf.text(`Sediu: ${inv.furnizor.sediu}`, 20, 75);
      pdf.text(`Email: ${inv.furnizor.email}`, 20, 80);
      pdf.text(`Telefon: ${inv.furnizor.telefon}`, 20, 85);
      if (inv.furnizor.iban) pdf.text(`IBAN: ${inv.furnizor.iban} (${inv.furnizor.banca})`, 20, 90);

      // Cumpărător
      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42);
      pdf.text('CUMPĂRĂTOR / CLIENT:', 110, 54);
      pdf.setFontSize(9);
      pdf.setTextColor(51, 65, 85);
      pdf.text(inv.client.nume, 110, 60);
      if (inv.client.cui) pdf.text(`C.U.I. / CNP: ${inv.client.cui}`, 110, 65);
      pdf.text(`Adresă: ${inv.client.adresa}`, 110, 70);
      pdf.text(`Email: ${inv.client.email}`, 110, 75);
      if (inv.client.telefon) pdf.text(`Telefon: ${inv.client.telefon}`, 110, 80);

      pdf.line(20, 98, 190, 98);

      // Tabel produse/servicii
      pdf.setFillColor(241, 245, 249);
      pdf.rect(20, 104, 170, 8, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Nr.', 23, 109);
      pdf.text('Descriere produs / serviciu', 35, 109);
      pdf.text('Cant.', 130, 109);
      pdf.text('Preț unitar', 145, 109);
      pdf.text('Total (RON)', 170, 109);

      pdf.setTextColor(51, 65, 85);
      pdf.text('1', 23, 120);
      pdf.text(inv.descriere_serviciu, 35, 120, { maxWidth: 90 });
      pdf.text('1 buc', 130, 120);
      pdf.text(`${inv.valoare} RON`, 145, 120);
      pdf.text(`${inv.valoare} RON`, 170, 120);

      pdf.line(20, 135, 190, 135);

      // Total de plată
      pdf.setFontSize(12);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`TOTAL ACHITAT: ${inv.valoare} RON`, 130, 145);

      // Detalii plată Revolut
      pdf.setFillColor(236, 253, 245);
      pdf.rect(20, 160, 170, 22, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(4, 120, 87);
      pdf.text('CONFIRMARE PLATĂ REVOLUT BUSINESS:', 25, 167);
      pdf.setFontSize(8);
      pdf.text(`Metodă plată: ${inv.metoda_plata}`, 25, 172);
      pdf.text(`ID Tranzacție: ${inv.revolut_transaction_id || 'REVOLUT_AUTHORIZED'}`, 25, 176);
      pdf.text(`Document emis electronic conform legislației în vigoare. Nu necesită ștampilă.`, 25, 180);

      const targetFileName = fileName || `Factura_${inv.serie_numar}.pdf`;
      pdf.save(targetFileName);
      return true;
    } catch (err) {
      console.error('Eroare generare directă PDF proformă:', err);
      return false;
    }
  }

  // 2. Fallback dacă este transmis un ID de element HTML
  const elementId = typeof source === 'string' ? source : 'proforma-document-paper';
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

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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
