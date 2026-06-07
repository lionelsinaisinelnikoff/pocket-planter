const bcrypt = require('bcryptjs');
const db = require('./db');

const defaultContent = {
  hero: {
    eyebrow: 'Presented by Rafael · AAESS 7B',
    title: 'Spat out a seed.<br>Built a pocket-sized<br><span class="text-secondary">forest machine.</span>',
    subtitle: 'While eating watermelon, Rafael Sinai-Sinelnikoff spat out the seeds — and realised they could grow into something amazing. So he invented <strong>The Pocket Planter</strong>: a fun, easy tool for kids aged <strong>5–16</strong> that works like a mix between a <em>PEZ dispenser</em> and a <em>water squirter</em>. Plant seeds anywhere you walk.',
    cta: "See How Rafael's Invention Works",
  },
  story: {
    lead: 'While eating watermelon, I spat out the seeds — and realised they could grow into something amazing.',
    body: "Most people would have wiped their hands and moved on. Rafael Sinai-Sinelnikoff looked closer. Those tiny black seeds weren't rubbish. They were the start of trees, shade, and life — if only planting were as simple as taking a walk.",
    body2: "But tree planting rates are falling. Rafael saw it in the data — fewer hectares planted every decade. <em>Why should growing green belong only to grown-ups with shovels and trucks?</em> As a student at <strong>AAESS 7B (2025/26)</strong>, building through Design &amp; Technology, Rafael asked a bigger question: what if every kid aged <strong>5 to 16</strong> could carry a garden in their pocket?",
    body3: "That's how The Pocket Planter was born — a tiny tool that helps you plant seeds anywhere. Not someday. Not when you're older. Today — on the path to school, in the park, wherever you find a patch of soil.",
    quote: 'I spat out the seeds and realised they could grow into something amazing.',
  },
  mission: {
    title: 'The world needs planters. Kids are ready.',
    body: "Forests need help. Tree planting rates in the UK have dropped sharply since the 1980s — and kids are growing up further from the soil beneath their feet. Rafael built The Pocket Planter because planting shouldn't wait until you're an expert.",
    body2: "The Pocket Planter turns any walk into a chance to grow. For kids aged 5–16, it's a pocket-sized way to make a real difference — one seed, one squirt of water, one patch of earth at a time. From pocket to plant. From one child to a greener tomorrow.",
    marketLine: 'From a world of 1.5 billion children, to 1.5 million in the UAE — Rafael\'s target starts right here: young planters aged 5–16.',
    stats: [
      { num: '5–16', label: 'Kids we built it for' },
      { num: '4', label: 'Easy steps to plant' },
      { num: '28', label: 'AED honest price' },
    ],
  },
  stepsIntro: {
    text: 'Four simple moves. One living miracle. Rafael designed it to work like a PEZ dispenser meets a water squirter — fun enough for kids, clever enough to actually work.',
  },
  steps: [
    { num: 1, title: 'Fill It Up', body: "Make sure the seed dispenser is full — pop in your seeds and you're ready for adventure." },
    { num: 2, title: 'Dig Your Spot', body: 'Dig a hole in any bed of soil you see with your built-in stick. School path, park edge, garden bed — anywhere life can take root.' },
    { num: 3, title: 'Shake & Drop', body: 'Give a nice shake and lift open the head of the PEZ — one perfect seed drops exactly where it should.' },
    { num: 4, title: 'Squirt & Grow', body: 'Squirt some water to hydrate your seed. Walk away knowing you just planted something amazing.' },
  ],
  shopIntro: {
    text: "Rafael built The Pocket Planter for kids who believe one seed can grow into something amazing. Now it's your turn — carry hope in your pocket and plant it wherever life finds soil.",
    heading: 'Carry Hope in Your Pocket',
  },
  product: {
    name: 'The Pocket Planter',
    tagline: 'From Pocket — To Plant',
    basePrice: 28,
    description: "Rafael's invention in your hands — a pocket-sized planting tool that combines three clever parts in one: a PEZ-style seed dispenser, a water pump system, and a digging stick. Fun for kids. Smart for parents. Designed for young adventurers aged 5–16 who want to plant seeds anywhere they walk.",
    addons: [
      { id: 'seeds', name: 'Customised Seeds', price: 5, description: 'Pick the seeds that match your adventure.' },
      { id: 'water', name: 'Fertilised Water', price: 5, description: 'Give your seed an extra boost from day one.' },
    ],
    benefitsKids: [
      'Works like a PEZ dispenser — shake, lift, drop one seed',
      'Built-in water squirter to hydrate your seed on the spot',
      'Dig anywhere with the attached stick',
      'Pocket-sized — take it on every walk',
    ],
    benefitsParents: [
      'Designed by a student inventor (AAESS 7B) through D&T',
      'Encourages outdoor play and environmental care',
      'Simple 4-step process kids can do independently',
      'Transparent pricing — 28 AED, no surprises',
    ],
  },
  pricing: {
    intro: "Rafael priced it honestly — 28 AED for the full Pocket Planter kit. Here's exactly what goes into every unit:",
    costTotal: 18,
    margin: 10,
    price: 28,
    components: [
      { name: 'PEZ dispenser system', cost: 8 },
      { name: 'Water pump system', cost: 3 },
      { name: 'Stick & plastic', cost: 2 },
      { name: 'Effort', cost: 5 },
    ],
    valueLine: "You're not just buying plastic and seeds. You're buying Rafael's design, testing, and belief that kids can help reforest the world — one pocket at a time.",
  },
  dilemma: {
    body: 'While eating watermelon, I spat out the seeds and realised they could grow into something amazing. Tree planting rates are falling — but one seed in the right pocket could change that. So I created The Pocket Planter: a tiny tool that helps you plant seeds anywhere.',
  },
  solution: {
    body: 'To fix this problem, I created The Pocket Planter — a fun, easy tool that works like a mix between a PEZ dispenser and a water squirter, letting you plant seeds anywhere.',
  },
  pitch: {
    equity: '20% equity',
    funding: '100,000 for development and marketing',
    email: 'RafaelSinaiSinelnikoff@students.aaess.sch.ae',
    technical: 'Aid from D&T and media for MVP, pilot and outreach',
    partnership: 'COGNITA as launch customer and promoter',
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