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
