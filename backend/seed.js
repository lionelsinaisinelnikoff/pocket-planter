const bcrypt = require('bcryptjs');
const db = require('./db');

const defaultContent = {
  hero: {
    title: 'Carry a forest<br><span class="text-secondary">in your pocket</span>',
    subtitle: 'Every seed holds a future. Pocket Planter puts the power to grow life right in your hands — wherever you walk, wherever wonder finds you.',
    cta: 'Begin Your Journey',
    eyebrow: 'From Pocket — To Plant',
  },
  story: {
    lead: 'It started with one seed — and one moment of wonder.',
    body: 'While eating watermelon, Rafael spat out a seed and saw not waste, but possibility — a tiny promise of green in a world that needs it more than ever. Trees are disappearing. Kids are losing touch with the earth beneath their feet. One seed became a question: what if planting could be as easy as taking a walk?',
    body2: 'Pocket Planter was born from that spark. A pocket-sized revolution that turns every child into a gardener, every path into potential soil, and every ordinary day into an act of hope. Seeds in one hand. Water in the other. The whole world waiting to grow.',
  },
  steps: [
    { num: 1, title: 'Load Your Dreams', body: 'Fill the dispenser with seeds you believe in — watermelon, wildflower, or whatever makes your heart beat faster.' },
    { num: 2, title: 'Plant With Purpose', body: 'Dig a small hole with your stick, give a shake, and drop one perfect seed exactly where life should begin.' },
    { num: 3, title: 'Give It Life', body: 'A splash of water. A breath of patience. Walk away knowing you just changed the world — one seed at a time.' },
  ],
  product: {
    name: 'Pocket Planter Kit',
    tagline: 'From Pocket — To Plant',
    basePrice: 28,
    description: 'Everything you need to turn any walk into a planting adventure — seed dispenser, water squirter, digging stick, all in one pocket-sized tool.',
    addons: [
      { id: 'seeds', name: 'Customised Seeds', price: 5 },
      { id: 'water', name: 'Fertilised Water', price: 5 },
    ],
  },
};

function setContent(key, value) {
  db.prepare(
    `INSERT INTO content (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(key, JSON.stringify(value));
}

Object.entries(defaultContent).forEach(([key, value]) => setContent(key, value));

const adminExists = db.prepare('SELECT id FROM admin WHERE id = 1').get();
if (!adminExists) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'pocketplanter2026', 10);
  db.prepare('INSERT INTO admin (id, password_hash) VALUES (1, ?)').run(hash);
}

console.log('Content seeded / updated.');