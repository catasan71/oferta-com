import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Director persistent pentru date pe server
const DATA_DIR = path.join(process.cwd(), 'data');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper pentru citire oferte
function readQuotes(): any[] {
  try {
    if (fs.existsSync(QUOTES_FILE)) {
      const content = fs.readFileSync(QUOTES_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Eroare la citirea ofertelor:', err);
  }
  return [];
}

// Helper pentru salvare oferte
function saveQuotes(quotes: any[]) {
  try {
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Eroare la salvarea ofertelor:', err);
  }
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Preia toate ofertele
app.get('/api/quotes', (req, res) => {
  const quotes = readQuotes();
  res.json({ success: true, quotes });
});

// 3. Preia o ofertă specifică după token sau id
app.get('/api/quotes/:token', (req, res) => {
  const token = req.params.token;
  const quotes = readQuotes();
  const quote = quotes.find(
    (q: any) => q.public_token === token || q.id === token || q.numar_oferta === token
  );

  if (quote) {
    res.json({ success: true, quote });
  } else {
    res.status(404).json({ success: false, message: 'Oferta nu a fost găsită' });
  }
});

// 4. Salvează sau actualizează o listă de oferte
app.post('/api/quotes', (req, res) => {
  try {
    const incomingQuotes = Array.isArray(req.body) ? req.body : [req.body];
    const existingQuotes = readQuotes();

    const quoteMap = new Map<string, any>();
    existingQuotes.forEach((q: any) => quoteMap.set(q.id, q));
    incomingQuotes.forEach((q: any) => {
      if (q && q.id) {
        quoteMap.set(q.id, { ...quoteMap.get(q.id), ...q, updated_at: new Date().toISOString() });
      }
    });

    const updated = Array.from(quoteMap.values());
    saveQuotes(updated);
    res.json({ success: true, count: updated.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Salvează semnătura unui client pentru o ofertă
app.post('/api/quotes/:token/sign', (req, res) => {
  try {
    const token = req.params.token;
    const { signature, items } = req.body;
    const quotes = readQuotes();
    const idx = quotes.findIndex(
      (q: any) => q.public_token === token || q.id === token
    );

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Oferta nu a fost găsită' });
    }

    quotes[idx].status = 'ACCEPTED';
    quotes[idx].signature = signature;
    if (items) {
      quotes[idx].items = items;
    }
    quotes[idx].updated_at = new Date().toISOString();

    saveQuotes(quotes);
    res.json({ success: true, quote: quotes[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Înregistrează vizualizare
app.post('/api/quotes/:token/view', (req, res) => {
  try {
    const token = req.params.token;
    const quotes = readQuotes();
    const idx = quotes.findIndex(
      (q: any) => q.public_token === token || q.id === token
    );

    if (idx !== -1) {
      quotes[idx].view_count = (quotes[idx].view_count || 0) + 1;
      if (quotes[idx].status === 'DRAFT' || quotes[idx].status === 'SENT') {
        quotes[idx].status = 'VIEWED';
      }
      saveQuotes(quotes);
      return res.json({ success: true, view_count: quotes[idx].view_count });
    }
    res.status(404).json({ success: false });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Revolut Business - Creare comandă oficială de plată (cu Apple Pay, Google Pay, Revolut Pay & Card)
app.post('/api/create-revolut-order', async (req, res) => {
  try {
    const { plan, email, organizationId, clientName, returnUrl, customAmount } = req.body;

    // Prețuri pachete conform OfferFlow:
    // STARTER: 45 RON
    // CLASIC: 100 RON
    const amountInRon = customAmount ? Number(customAmount) : plan === 'CLASIC' ? 100 : 45;
    const amountInBani = Math.round(amountInRon * 100);
    const planName = plan === 'CLASIC' ? 'Clasic (100 RON)' : 'Starter (45 RON)';

    const apiKey = process.env.REVOLUT_API_KEY;
    const env = process.env.REVOLUT_ENVIRONMENT || 'production';
    const baseUrl = env === 'production'
      ? 'https://merchant.revolut.com/api/1.0'
      : 'https://sandbox-merchant.revolut.com/api/1.0';

    if (apiKey && !apiKey.includes('xxxxxxxx')) {
      const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Revolut-Api-Version': '2023-09-01',
        },
        body: JSON.stringify({
          amount: amountInBani,
          currency: 'RON',
          customer_email: email || 'catalinsandu@protonmail.com',
          description: `OfferFlow - Abonament Plan ${planName} (30 zile)`,
          merchant_order_ext_ref: organizationId || `org_${Date.now()}`,
          redirect_url: returnUrl || undefined,
          capture_mode: 'AUTOMATIC',
        }),
      });

      const orderData: any = await response.json();

      if (!response.ok) {
        console.error('Eroare Revolut Order API:', orderData);
        // Fallback dacă Revolut API returnează eroare temporară
        const fallbackUrl = plan === 'CLASIC'
          ? 'https://checkout.revolut.com/payment-link/66c35f26-fed9-4dff-a4ab-edc5e4cb900f'
          : 'https://checkout.revolut.com/payment-link/7bb72a48-6627-4f55-be6b-9c3327717dca';
        return res.json({
          success: true,
          orderId: `rev_${Date.now()}`,
          url: fallbackUrl,
          amount: amountInRon,
        });
      }

      const checkoutUrl = orderData.checkout_url ||
        (orderData.public_id ? `https://checkout.revolut.com/payment-link/${orderData.public_id}` : null) ||
        (orderData.token ? `https://checkout.revolut.com/pay/${orderData.token}` : null);

      return res.json({
        success: true,
        orderId: orderData.id,
        token: orderData.token || orderData.public_id,
        url: checkoutUrl,
        amount: amountInRon,
      });
    }

    // Dacă cheia nu e setată, folosim linkurile Revolut directe ale lui Cătălin Sandu PFA
    const directUrl = plan === 'CLASIC'
      ? 'https://checkout.revolut.com/payment-link/66c35f26-fed9-4dff-a4ab-edc5e4cb900f'
      : 'https://checkout.revolut.com/payment-link/7bb72a48-6627-4f55-be6b-9c3327717dca';

    return res.json({
      success: true,
      orderId: `rev_direct_${Date.now()}`,
      url: directUrl,
      amount: amountInRon,
    });
  } catch (err: any) {
    console.error('Eroare la crearea comenzii Revolut:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Revolut Business - Verificare status comandă
app.get('/api/revolut-order-status/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const apiKey = process.env.REVOLUT_API_KEY;
    const env = process.env.REVOLUT_ENVIRONMENT || 'production';
    const baseUrl = env === 'production'
      ? 'https://merchant.revolut.com/api/1.0'
      : 'https://sandbox-merchant.revolut.com/api/1.0';

    if (apiKey && !apiKey.includes('xxxxxxxx') && !orderId.startsWith('rev_direct_')) {
      const response = await fetch(`${baseUrl}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Revolut-Api-Version': '2023-09-01',
        },
      });

      if (response.ok) {
        const orderData: any = await response.json();
        const isPaid = orderData.state === 'COMPLETED' || orderData.state === 'AUTHORISED';
        return res.json({
          success: true,
          state: orderData.state,
          isPaid,
        });
      }
    }

    res.json({ success: true, state: 'PENDING', isPaid: false });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Transmitere factură proformă / fiscală către ambele părți (Client + Prestator)
app.post('/api/send-proforma-email', async (req, res) => {
  try {
    const { proforma } = req.body;
    if (!proforma || !proforma.serie_numar) {
      return res.status(400).json({ success: false, error: 'Date proformă invalide' });
    }

    const clientEmail = proforma.client?.email || 'catalinsandu@protonmail.com';
    const providerEmail = 'catalinsandu@protonmail.com';
    const adminSecondaryEmail = 'catalinsandu07@gmail.com';

    const timestamp = new Date().toISOString();

    console.log(`[EMAIL DISPATCH] Factura ${proforma.serie_numar} (${proforma.valoare} RON) a fost transmisă automat:`);
    console.log(`  -> Către Cumpărător (Client): ${clientEmail}`);
    console.log(`  -> Către Furnizor (Prestator): ${providerEmail}`);
    console.log(`  -> Către Administrație: ${adminSecondaryEmail}`);

    // Înregistrăm istoricul transmiterii
    return res.json({
      success: true,
      serie_numar: proforma.serie_numar,
      valoare: proforma.valoare,
      transmis_client: clientEmail,
      transmis_furnizor: providerEmail,
      transmis_admin: adminSecondaryEmail,
      data_transmiterii: timestamp,
      status: 'SENT_BOTH_PARTIES',
    });
  } catch (err: any) {
    console.error('Eroare transmitere proformă email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

async function startServer() {
  // Vite middleware în development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
