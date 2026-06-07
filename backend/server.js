const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'pocket-planter-secret-change-in-production';
const ROOT = path.join(__dirname, '..');
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'uploads'), { recursive: true });

if (!db.prepare('SELECT COUNT(*) as c FROM content').get().c) {
  require('./seed');
}

app.use(cors());

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.sendStatus(400);
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.sendStatus(400);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    db.prepare(
      "UPDATE orders SET status = 'paid' WHERE customer_email = ? AND status = 'pending_payment' ORDER BY created_at DESC LIMIT 1"
    ).run(session.customer_email);
  }
  res.json({ received: true });
});

app.use(express.json());
app.use(express.static(ROOT));
app.use('/uploads', express.static(path.join(ROOT, 'uploads')));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(ROOT, 'uploads')),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function getContent(key) {
  const row = db.prepare('SELECT value FROM content WHERE key = ?').get(key);
  return row ? JSON.parse(row.value) : null;
}

function setContent(key, value) {
  db.prepare(
    `INSERT INTO content (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(key, JSON.stringify(value));
}

// ─── Auth ───────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const admin = db.prepare('SELECT password_hash FROM admin WHERE id = 1').get();
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// ─── Content API ──────────────────────────────────────────
app.get('/api/content', (_, res) => {
  const rows = db.prepare('SELECT key, value FROM content').all();
  const content = {};
  rows.forEach((r) => { content[r.key] = JSON.parse(r.value); });

  content.videos = db.prepare(
    'SELECT id, title, description, video_url as videoUrl, poster_url as posterUrl, sort_order as sortOrder FROM videos WHERE active = 1 ORDER BY sort_order'
  ).all();

  content.gallery = db.prepare(
    'SELECT id, src, alt FROM gallery WHERE active = 1 ORDER BY sort_order'
  ).all();

  res.json(content);
});

app.put('/api/content/:key', auth, (req, res) => {
  setContent(req.params.key, req.body);
  res.json({ ok: true });
});

// ─── Videos ─────────────────────────────────────────────
app.get('/api/videos', (_, res) => {
  res.json(db.prepare('SELECT * FROM videos ORDER BY sort_order').all());
});

app.post('/api/videos', auth, (req, res) => {
  const { title, description, videoUrl, posterUrl, sortOrder } = req.body;
  const result = db.prepare(
    'INSERT INTO videos (title, description, video_url, poster_url, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description, videoUrl, posterUrl, sortOrder || 0);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/videos/:id', auth, (req, res) => {
  const { title, description, videoUrl, posterUrl, sortOrder, active } = req.body;
  db.prepare(
    'UPDATE videos SET title=?, description=?, video_url=?, poster_url=?, sort_order=?, active=? WHERE id=?'
  ).run(title, description, videoUrl, posterUrl, sortOrder, active ?? 1, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/videos/:id', auth, (req, res) => {
  db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Gallery ────────────────────────────────────────────
app.get('/api/gallery', (_, res) => {
  res.json(db.prepare('SELECT * FROM gallery ORDER BY sort_order').all());
});

app.post('/api/gallery', auth, (req, res) => {
  const { src, alt, sortOrder } = req.body;
  const result = db.prepare('INSERT INTO gallery (src, alt, sort_order) VALUES (?, ?, ?)').run(src, alt, sortOrder || 0);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/gallery/:id', auth, (req, res) => {
  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Stripe Checkout ────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not configured. Set STRIPE_SECRET_KEY in your environment.',
    });
  }

  const { customer, items, total } = req.body;
  if (!customer?.email || !items?.length || !total) {
    return res.status(400).json({ error: 'Invalid checkout data' });
  }

  try {
    const lineItems = items.map((item) => {
      const addonText = item.addons?.length ? ` (${item.addons.join(', ')})` : '';
      return {
        price_data: {
          currency: 'aed',
          product_data: {
            name: `${item.name}${addonText}`,
            description: 'Pocket Planter — From Pocket to Plant',
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customer.email,
      line_items: lineItems,
      success_url: `${SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cancel.html`,
      metadata: {
        customer_name: customer.name || '',
        order_total: String(total),
      },
    });

    const orderId = `PP-${Date.now().toString(36).toUpperCase()}`;
    db.prepare(
      'INSERT INTO orders (id, customer_name, customer_email, items, total, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(orderId, customer.name || '', customer.email, JSON.stringify(items), total, 'pending_payment');

    res.json({ url: session.url, sessionId: session.id, orderId });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Orders ─────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { id, customer, items, total } = req.body;
  if (!id || !customer?.name || !customer?.email || !items?.length) {
    return res.status(400).json({ error: 'Invalid order data' });
  }
  db.prepare(
    'INSERT INTO orders (id, customer_name, customer_email, customer_school, customer_notes, items, total) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, customer.name, customer.email, customer.school || '', customer.notes || '', JSON.stringify(items), total);
  res.json({ ok: true, id });
});

app.get('/api/orders', auth, (_, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  orders.forEach((o) => { o.items = JSON.parse(o.items); });
  res.json(orders);
});

app.patch('/api/orders/:id', auth, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ ok: true });
});

// ─── Media Upload ───────────────────────────────────────
app.post('/api/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// ─── CMS Admin ──────────────────────────────────────────
app.get('/admin', (_, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', service: 'pocket-planter-api' });
});

app.listen(PORT, () => {
  console.log(`Pocket Planter server running at http://localhost:${PORT}`);
  console.log(`CMS admin at http://localhost:${PORT}/admin`);
});