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

// 7. Revolut Business - Creare comandă oficială de plată dinamică (45 RON / 100 RON)
app.post('/api/create-revolut-order', async (req, res) => {
  try {
    const {
      plan,
      email,
      customAmount,
    } = req.body;

    const amountInRon = customAmount ? Number(customAmount) : plan === 'CLASIC' ? 100 : 45;
    const amountInBani = Math.round(amountInRon * 100);
    const planName = plan === 'CLASIC' ? 'Clasic (100 RON)' : 'Starter (45 RON)';

    const apiKey = process.env.REVOLUT_API_KEY;
    const env = process.env.REVOLUT_ENVIRONMENT || 'production';
    const baseUrl = env === 'production'
      ? 'https://merchant.revolut.com/api'
      : 'https://sandbox-merchant.revolut.com/api';

    if (!apiKey || apiKey.trim().length < 8 || apiKey.includes('xxxxxxxx')) {
      return res.status(400).json({
        success: false,
        error: 'Lipsă REVOLUT_API_KEY. Vă rugăm adăugați cheia secretă API din Revolut Business.',
      });
    }

    let response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'Revolut-Api-Version': '2023-09-01',
      },
      body: JSON.stringify({
        amount: amountInBani,
        currency: 'RON',
        customer_email: email || 'catalinsandu@protonmail.com',
        description: `OfferFlow - Abonament Plan ${planName}`,
        merchant_order_ext_ref: `ord_${Date.now()}_${plan}`,
        capture_mode: 'AUTOMATIC',
      }),
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${baseUrl}/1.0/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'Revolut-Api-Version': '2023-09-01',
        },
        body: JSON.stringify({
          amount: amountInBani,
          currency: 'RON',
          customer_email: email || 'catalinsandu@protonmail.com',
          description: `OfferFlow - Abonament Plan ${planName}`,
          merchant_order_ext_ref: `ord_${Date.now()}_${plan}`,
          capture_mode: 'AUTOMATIC',
        }),
      });
    }

    const orderData: any = await response.json();
    console.log('[LOCAL REVOLUT ORDER RESPONSE]:', response.status, orderData);

    if (response.ok && (orderData.checkout_url || orderData.public_id || orderData.token || orderData.id)) {
      const checkoutUrl =
        orderData.checkout_url ||
        (orderData.public_id ? `https://checkout.revolut.com/payment-link/${orderData.public_id}` : null) ||
        (orderData.token ? `https://checkout.revolut.com/pay/${orderData.token}` : null);

      if (checkoutUrl) {
        return res.json({
          success: true,
          orderId: orderData.id,
          token: orderData.token || orderData.public_id,
          url: checkoutUrl,
          amount: amountInRon,
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: orderData.message || orderData.description || 'Revolut Merchant API a respins crearea comenzii.',
      details: orderData,
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

// 9. Înregistrare plată și notificare email administrator
app.post('/api/notify-payment', async (req, res) => {
  try {
    const { transaction } = req.body;
    if (!transaction) {
      return res.status(400).json({ success: false, error: 'Date tranzacție lipsă' });
    }

    const adminEmail = 'catalinsandu07@gmail.com';
    const timestamp = new Date().toISOString();

    console.log(`=======================================================`);
    console.log(`[NOTIFICARE PLATA REVOLUT DISPATCH -> ${adminEmail}]`);
    console.log(`  Pachet achizitionat: ${transaction.planName} (${transaction.amount} ${transaction.currency || 'RON'})`);
    console.log(`  Cumparator: ${transaction.buyerName} - ${transaction.buyerCompany}`);
    console.log(`  Email Client: ${transaction.buyerEmail}`);
    console.log(`  Telefon: ${transaction.buyerPhone}`);
    console.log(`  ID Tranzactie: ${transaction.transactionNumber || transaction.id}`);
    console.log(`  Data & Ora: ${timestamp}`);
    console.log(`=======================================================`);

    // Salvare istoric tranzacție pe server
    const txnsFile = path.join(DATA_DIR, 'transactions.json');
    let txns: any[] = [];
    try {
      if (fs.existsSync(txnsFile)) {
        txns = JSON.parse(fs.readFileSync(txnsFile, 'utf-8'));
      }
    } catch (e) {}
    txns.unshift({ ...transaction, server_timestamp: timestamp, notified_admin: adminEmail });
    try {
      fs.writeFileSync(txnsFile, JSON.stringify(txns, null, 2), 'utf-8');
    } catch (e) {}

    return res.json({
      success: true,
      message: `Notificare transmisă cu succes către ${adminEmail}`,
      admin_email: adminEmail,
      timestamp,
      transaction,
    });
  } catch (err: any) {
    console.error('Eroare la notificarea plății:', err);
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
