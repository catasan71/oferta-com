import { Quote } from '../types.ts';

/**
 * Codifică o ofertă într-un payload compact base64 pentru a fi inclus în hash-ul URL-ului.
 * Permite deschiderea ofertei pe orice dispozitiv mobil/client chiar și fără acces direct la baza de date locală.
 */
export function encodeQuoteToHash(quote: Quote): string {
  try {
    const minified = {
      id: quote.id,
      titlu: quote.titlu,
      numar: quote.numar_oferta,
      client: quote.client_name,
      email: quote.client_email,
      phone: quote.client_phone,
      cui: quote.client_cui,
      total: quote.valoare_totala,
      tva: quote.valoare_tva,
      moneda: quote.moneda || 'RON',
      status: quote.status,
      token: quote.public_token,
      exp: quote.expires_at,
      termeni: quote.termeni_plata,
      items: (quote.items || []).map((it) => ({
        id: it.id,
        cod: it.cod_articol || '',
        titlu: it.titlu,
        desc: it.descriere || '',
        tip: it.tip_articol || 'produs',
        prod: it.producator || '',
        cant: it.cantitate,
        um: it.um || 'buc',
        pu: it.pret_unitar,
        disc: it.discount_procent || 0,
        tot: it.total,
        opt: !!it.este_optional,
        sel: it.este_selectat !== false,
      })),
      org: quote.organization
        ? {
            id: quote.organization.id,
            nume: quote.organization.nume,
            cui: quote.organization.cui,
            adresa: quote.organization.adresa,
            iban: quote.organization.iban,
            logo: quote.organization.logo_url,
            color: quote.organization.brand_color,
          }
        : undefined,
    };

    const jsonStr = JSON.stringify(minified);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.error('Eroare la codificarea ofertei portabile:', err);
    return '';
  }
}

/**
 * Decodifică payload-ul base64 dintr-un hash URL pentru a reface obiectul Quote complet.
 */
export function decodeQuoteFromHash(encoded: string): Quote | null {
  try {
    if (!encoded) return null;
    const cleanStr = encoded.startsWith('#d=')
      ? encoded.replace('#d=', '')
      : encoded.startsWith('d=')
      ? encoded.replace('d=', '')
      : encoded;

    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const data = JSON.parse(jsonStr);

    if (!data.id && !data.token && !data.titlu) return null;

    const reconstructed: Quote = {
      id: data.id || `quote-${Date.now()}`,
      organizationId: data.org?.id || 'org-imported',
      titlu: data.titlu || 'Ofertă Comercială',
      numar_oferta: data.numar || 'OF-IMPORT',
      client_name: data.client || 'Client Partener',
      client_email: data.email || '',
      client_phone: data.phone || '',
      client_cui: data.cui || '',
      valoare_totala: Number(data.total) || 0,
      valoare_tva: Number(data.tva) || 0,
      moneda: data.moneda || 'RON',
      status: data.status || 'SENT',
      public_token: data.token || 'tk-imported',
      view_count: 1,
      expires_at: data.exp || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      termeni_plata: data.termeni || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization: data.org
        ? {
            id: data.org.id,
            nume: data.org.nume,
            cui: data.org.cui,
            adresa: data.org.adresa,
            iban: data.org.iban,
            logo_url: data.org.logo,
            brand_color: data.org.color || '#2563eb',
            moneda_implicita: data.moneda || 'RON',
            reg_com: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : undefined,
      items: (data.items || []).map((it: any, idx: number) => ({
        id: it.id || `item-${idx}`,
        quoteId: data.id || 'quote-imported',
        cod_articol: it.cod || '',
        titlu: it.titlu || 'Articol',
        descriere: it.desc || '',
        tip_articol: it.tip || 'produs',
        producator: it.prod || '',
        cantitate: Number(it.cant) || 1,
        um: it.um || 'buc',
        pret_unitar: Number(it.pu) || 0,
        discount_procent: Number(it.disc) || 0,
        total: Number(it.tot) || 0,
        este_optional: !!it.opt,
        este_selectat: it.sel !== false,
      })),
      feedbacks: [],
      signature: null,
    };

    return reconstructed;
  } catch (err) {
    console.error('Eroare la decodificarea ofertei portabile:', err);
    return null;
  }
}
