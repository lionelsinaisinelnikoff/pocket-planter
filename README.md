# Pocket Planter

A dynamic marketing and e-commerce website for **The Pocket Planter** — a fun, pocket-sized seed planting tool for kids aged 5–16.

**From Pocket — To Plant.**

## Features

- Brand box design system (Plus Jakarta Sans, MD3 green palette)
- Inspirational videos generated with Grok Imagine
- CMS admin panel for content, videos, gallery, and orders
- REST API backend with SQLite
- Shopping cart with add-on bundles and checkout
- Fully responsive, mobile-first design

## Quick Start

### Full stack (recommended)

```bash
cd backend
npm install
npm start
```

- **Site:** http://localhost:3000
- **CMS Admin:** http://localhost:3000/admin
- **Default password:** `pocketplanter2026`

### Static only (GitHub Pages)

Open `index.html` or serve with:

```bash
python3 -m http.server 8080
```

Videos and fallback content work without the backend. CMS and order API require the Node server.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/content` | All site content, videos, gallery |
| POST | `/api/orders` | Submit checkout order |
| POST | `/api/auth/login` | CMS login |
| GET/POST/PUT/DELETE | `/api/videos` | Manage videos (auth) |
| GET/POST/DELETE | `/api/gallery` | Manage gallery (auth) |

## Inspirational Videos

Three cinematic videos illustrate the Pocket Planter vision:

1. **Plant Anywhere** — kids planting in a sunny park
2. **Seed to Sprout** — macro seed growth moment
3. **Every Walk is a Garden** — family planting on nature walks

Generated with Grok Imagine keyframes, animated with cinematic Ken Burns motion.

## Live Site

https://lionelsinaisinelnikoff.github.io/pocket-planter/

## Founder

Rafael Sinai-Sinelnikoff — AAESS 7B, 2025/26