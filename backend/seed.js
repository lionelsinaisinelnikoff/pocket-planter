const bcrypt = require('bcryptjs');
const db = require('./db');

const defaultContent = {
  hero: {
    title: 'The Pocket Planter: From Pocket - To Plant',
    subtitle: 'Helping you plant seeds anywhere. Turn every walk into a mini-adventure of reforestation.',
    cta: 'Start Growing',
    stats: { price: 28, steps: 4, ages: '5–16' },
  },
  dilemma: {
    title: 'The Dilemma',
    body: 'While eating watermelon, I spat out the seeds and realized they could grow into something amazing. So I created the Pocket Planter — a tiny tool that helps you plant seeds anywhere.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOvrdz_bKUdNMhBRHoVY8SXssgPdAzDrIy3NlNO3fCDz6KDZlEwN7k9wczXy4YmCq-hFOxGWMJF-bIcYuv-_KJiQ6wzf48HsYTwCOZ70hG72gjhD2YXxNHJ1QECcoPLFUsEntslWrsHN3Nyx4_tRb-P2r5YYTYsZrGNLyxBKo6h94ZsQeZ05b9FiGS3YHI4NZ3H7lRlbZmL4JlV5_r1iWGeiiC-oGiWTyEE_5C0PmjN85CqoLCMF2CCJEezpcyT2hdLMxCMLc0oX0',
  },
  solution: {
    title: 'My Solution',
    body: 'To fix this problem, I created the Pocket Planter — a fun, easy tool that works like a mix between a PEZ dispenser and a water squirter, letting you plant seeds anywhere.',
    features: [
      { icon: 'distance', label: 'Dispenser Tech' },
      { icon: 'water_drop', label: 'Hydration Squirter' },
    ],
  },
  impact: {
    title: 'Global Impact Goal',
    target: 'Kids Ages 5–16',
    metric: '1.5B',
    metricLabel: 'World Need',
    progress: 85,
    quote: 'Empowering the next generation of eco-warriors.',
  },
  steps: [
    { num: 1, title: 'Fill the Dispenser', body: 'Make sure that the seed dispenser is full of your favorite seeds.' },
    { num: 2, title: 'Prepare the Soil', body: 'Dig a hole in any bed of soil you see with your stick.' },
    { num: 3, title: 'The PEZ Shake', body: 'Give a nice shake and lift open the head of the PEZ to drop the seed.' },
    { num: 4, title: 'Hydrate Your Seed', body: 'Squirt some water to hydrate your seed and start the magic!' },
  ],
  product: {
    name: 'Pocket Planter Kit',
    tagline: 'From Pocket — To Plant',
    basePrice: 28,
    description: 'Includes the PEZ-style seed dispenser, water pump system, digging stick, and pocket planter body.',
    addons: [
      { id: 'seeds', name: 'Customised Seeds', price: 5 },
      { id: 'water', name: 'Fertilised Water', price: 5 },
    ],
    breakdown: [
      { label: 'PEZ dispenser system', value: '8 AED' },
      { label: 'Water pump system', value: '3 AED' },
      { label: 'Stick & plastic body', value: '2 AED' },
      { label: 'Assembly & design', value: '5 AED' },
    ],
  },
  pitch: {
    title: 'The Pitch',
    equity: '20% Equity Ask',
    funding: '100,000 AED for development and marketing',
    founder: 'Rafael Sinai-Sinelnikoff',
    school: 'AAESS 7B — 2025/26',
    email: 'rafaelsinais@students.aaess.sch.ae',
  },
};

function setContent(key, value) {
  db.prepare(
    `INSERT INTO content (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(key, JSON.stringify(value));
}

Object.entries(defaultContent).forEach(([key, value]) => setContent(key, value));

const videoCount = db.prepare('SELECT COUNT(*) as c FROM videos').get().c;
if (videoCount === 0) {
  const insertVideo = db.prepare(
    'INSERT INTO videos (title, description, video_url, poster_url, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  const videos = [
    ['Plant Anywhere', 'See how kids turn every walk into a planting adventure with Pocket Planter.', '/assets/videos/plant-anywhere.mp4', '/assets/videos/posters/plant-anywhere.jpg', 1],
    ['Seed to Sprout', 'Watch the magic of growth — from a tiny seed to a living plant.', '/assets/videos/seed-sprout.mp4', '/assets/videos/posters/seed-sprout.jpg', 2],
    ['Every Walk is a Garden', 'Families planting together, one pocketful of nature at a time.', '/assets/videos/walk-garden.mp4', '/assets/videos/posters/walk-garden.jpg', 3],
  ];
  videos.forEach((v) => insertVideo.run(...v));
}

const galleryCount = db.prepare('SELECT COUNT(*) as c FROM gallery').get().c;
if (galleryCount === 0) {
  const insertGallery = db.prepare(
    'INSERT INTO gallery (src, alt, sort_order) VALUES (?, ?, ?)'
  );
  const images = [
    ['/assets/images/IMG_4217.jpg', 'Pocket Planter kit front view', 1],
    ['/assets/images/IMG_4218.jpg', 'Pocket Planter side view', 2],
    ['/assets/images/IMG_4219.jpg', 'Pocket Planter seed dispenser', 3],
    ['/assets/images/IMG_4220.jpg', 'Pocket Planter water squirter', 4],
    ['/assets/images/IMG_4221.jpg', 'Pocket Planter in use', 5],
    ['/assets/images/IMG_4270.jpg', 'Pocket Planter held in hand', 6],
  ];
  images.forEach((img) => insertGallery.run(...img));
}

const adminExists = db.prepare('SELECT id FROM admin WHERE id = 1').get();
if (!adminExists) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'pocketplanter2026', 10);
  db.prepare('INSERT INTO admin (id, password_hash) VALUES (1, ?)').run(hash);
}

console.log('Database seeded successfully.');
console.log('Default admin password: pocketplanter2026');