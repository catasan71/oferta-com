import { Quote } from '../types.ts';
import { formatCurrency, formatDate } from './calculations.ts';

/**
 * Generează textul plain-text structurat modern, cu chenar vizual, separatori și link evidențiat.
 */
export function generatePlainTextEmail(quote: Quote, publicUrl: string): string {
  const orgName = quote.organization?.nume || 'Compania noastră';
  const valoare = formatCurrency(quote.valoare_totala, quote.moneda);
  const dataValabila = quote.expires_at ? formatDate(quote.expires_at) : '30 de zile';

  return `Bună ziua ${quote.client_name},

Vă transmitem oferta comercială pregătită pentru dumneavoastră. Puteți analiza specificațiile, selecta opționalele dorite și semna digital documentul direct online:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ${quote.numar_oferta} — ${quote.titlu}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Valoare Totală:        ${valoare}
• Termen de valabilitate: ${dataValabila}
• Emitent:                ${orgName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👉 DESCHIDE & SEMNEAZĂ OFERTA ONLINE:
${publicUrl}

🛡️ Securizat • Fără cont • Accesibil instant pe telefon sau computer

Link direct de rezervă:
${publicUrl}

Cu stimă,
${orgName} • Trimis prin platforma securizată OfferFlow`;
}

/**
 * Generează un template HTML complet pentru email, reproducând cu exactitate de 100%
 * designul modern din preview: header întunecat cu badge-ul companiei, corp alb curat,
 * tabel compact cu valorile esențiale, butonul CTA evidențiat albastru-indigo,
 * casetă punctată pentru linkul securizat și footer discret.
 */
export function generateHtmlEmail(quote: Quote, publicUrl: string): string {
  const orgName = quote.organization?.nume || 'OfferFlow';
  const valoare = formatCurrency(quote.valoare_totala, quote.moneda);
  const dataValabila = quote.expires_at ? formatDate(quote.expires_at) : '30 de zile';

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ofertă Comercială ${quote.numar_oferta} - ${quote.titlu}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08);">
    
    <!-- Header întunecat elegant cu badge companie (exact ca în preview) -->
    <div style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); padding: 20px 24px; color: #ffffff; border-bottom: 2px solid #2563eb;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="left" valign="middle">
            <span style="display: block; font-size: 10px; font-weight: 800; color: #60a5fa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
              OFERTĂ COMERCIALĂ DIGITALĂ
            </span>
            <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff; line-height: 1.2;">
              ${quote.numar_oferta}
            </h2>
            <div style="margin-top: 4px; font-size: 13px; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;">
              ${quote.titlu}
            </div>
          </td>
          <td align="right" valign="top">
            <span style="display: inline-block; padding: 6px 14px; background-color: rgba(37, 99, 235, 0.25); border: 1px solid rgba(96, 165, 250, 0.4); border-radius: 20px; color: #93c5fd; font-size: 11px; font-weight: 700; text-align: right;">
              ${orgName}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Corpul emailului -->
    <div style="padding: 24px 24px 20px; color: #334155; font-size: 14px; line-height: 1.6;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #475569;">
        Bună ziua <strong>${quote.client_name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 13px; color: #475569; line-height: 1.6;">
        Vă transmitem oferta comercială pregătită pentru dumneavoastră. Puteți analiza specificațiile, selecta opționalele dorite și semna digital documentul direct online.
      </p>

      <!-- Caseta rezumat ofertă cu Valoare, Valabilitate, Emitent -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 22px; overflow: hidden;">
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size: 12px; color: #64748b; font-weight: 600;">Valoare Totală:</td>
                <td align="right" style="font-size: 17px; font-weight: 800; color: #0f172a;">${valoare}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 16px 6px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size: 12px; color: #64748b;">Termen de valabilitate:</td>
                <td align="right" style="font-size: 12px; font-weight: 600; color: #1e293b;">${dataValabila}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 16px 12px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size: 12px; color: #64748b;">Emitent:</td>
                <td align="right" style="font-size: 12px; font-weight: 600; color: #1e293b;">${orgName}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Buton Mare Evidențiat CTA (Deschide & Semnează Oferta Online) -->
      <div style="text-align: center; margin: 24px 0 16px;">
        <a href="${publicUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #4f46e5; background-image: linear-gradient(to right, #2563eb, #4f46e5); color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.35); text-align: center;">
          <span style="display: inline-block; vertical-align: middle; margin-right: 6px;">👉</span>
          <span style="vertical-align: middle; color: #ffffff;">Deschide &amp; Semnează Oferta Online</span>
        </a>
        <div style="margin-top: 10px; font-size: 11px; color: #64748b;">
          🛡️ Securizat • Fără cont • Accesibil instant pe telefon sau computer
        </div>
      </div>

      <!-- Caseta Link direct securizat punctată (exact ca în preview) -->
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; margin-top: 20px; font-size: 11px; line-height: 1.5;">
        <span style="color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">Link direct securizat:</span>
        <a href="${publicUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; word-break: break-all; font-family: monospace;">
          ${publicUrl}
        </a>
      </div>
    </div>

    <!-- Footer discret -->
    <div style="background-color: #f8fafc; padding: 14px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
      ${orgName} • Trimis prin platforma securizată OfferFlow
    </div>
  </div>
</body>
</html>`;
}
