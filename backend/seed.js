const bcrypt = require('bcryptjs');
const db = require('./db');

const defaultContent = {
  hero: {
    title: 'One seed.<br>One walk.<br><span class="text-secondary">A forest waiting to grow.</span>',
    subtitle: 'It began with Rafael, a watermelon, and a question no one had asked: <em>what if every child could carry the power to plant hope — anywhere they walk?</em>',
    cta: "Read Rafael's Journey",
    eyebrow: 'From Pocket — To Plant',
  },
  story: {
    lead: 'While eating watermelon, Rafael spat out a seed — and saw not waste, but a world waiting to be born.',
    body: 'Rafael Sinai-Sinelnikoff was eating watermelon when he spat out the seeds. Most people would have looked away. Rafael looked closer. He realised those tiny seeds could grow into something amazing — trees, shade, life — if only planting were as simple as taking a walk.',
    body2: "That single moment became a mission. A student at AAESS, building his Pocket Planter through Ylab's Design & Technology programme, Rafael asked a bigger question: <em>why should reforestation belong only to experts with shovels and trucks?</em> What if every child aged 5 to 16 could become a gardener of tomorrow — seeds in one pocket, water in the other, the whole world as their garden?",
    body3: 'Pocket Planter was born from that spark — a pocket-sized revolution mixing the joy of a PEZ dispenser with the care of a water squirter. Fun, easy, and ready for any patch of soil you pass on your journey.',
  },
  mission: {
    title: 'Because the world is losing its green',
    body: 'Forests are disappearing. Tree-planting rates are falling. Children are growing up further from the soil beneath their feet. The UAE has set ambitious targets — 75 million mangroves, 1.5 million hectares of forest. The world needs 1.5 billion hectares restored. One pocket cannot fix the planet alone. But a million pockets can.',
    body2: "Pocket Planter is Rafael's answer: a fun, easy tool that turns reforestation into an adventure kids actually want to join. Plant on the way to school. Plant in the park. Plant wherever life finds a patch of earth. Every seed is a promise to the future.",
  },
  steps: [
    { num: 1, title: 'Fill Your Dreams', body: 'Make sure the seed dispenser is full — watermelon, wildflower, or whatever seed your heart chooses.' },
    { num: 2, title: 'Dig With Purpose', body: 'Use the built-in stick to dig a small hole in any bed of soil you find along your path.' },
    { num: 3, title: 'Drop One Seed', body: 'Give a nice shake and lift open the head — one perfect seed drops exactly where life should begin.' },
    { num: 4, title: 'Give It Life', body: 'Squirt water to hydrate your seed. Walk away knowing you just planted hope for tomorrow.' },
  ],
  product: {
    name: 'Pocket Planter Kit',
    tagline: 'From Pocket — To Plant',
    basePrice: 28,
    description: "Rafael's invention in your hands — a PEZ-style seed dispenser, built-in water squirter, and digging stick, all in one pocket-sized tool. Designed for adventurers aged 5–16 (and the grown-ups who cheer them on).",
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