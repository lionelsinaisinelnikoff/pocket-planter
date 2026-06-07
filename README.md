# Pocket Planter

**From Pocket — To Plant.**

An inspirational site to present and sell the Pocket Planter — a pocket-sized seed planting tool for kids.

## Sections

1. **Home** — Hero with inspirational messaging
2. **Story** — The origin and vision
3. **How It Works** — 3 simple steps
4. **Shop** — Buy with Stripe checkout

## Quick Start

```bash
cd backend
npm install
cp .env.example .env   # Add your Stripe keys
npm start
```

- **Site:** http://localhost:3000
- **CMS:** http://localhost:3000/admin (password: `pocketplanter2026`)

## Stripe Setup

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Copy your **Secret key** from [API keys](https://dashboard.stripe.com/apikeys)
3. Add to `backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   SITE_URL=http://localhost:3000
   ```
4. For production, set `SITE_URL` to your deployed URL
5. Optional: add a [webhook](https://dashboard.stripe.com/webhooks) pointing to `/api/stripe-webhook` for payment confirmations

## Live Site

https://www.pocket-planter.com

> Stripe checkout requires the Node backend on Render (`pocket-planter-api`). The static GitHub Pages site shows the shop but redirects to Stripe only when the API is available.

## Custom Domain (Gandi)

DNS records at [Gandi](https://admin.gandi.net/):

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `lionelsinaisinelnikoff.github.io` |

Remove any default Gandi parking/redirection records first. DNS can take up to 24 hours to propagate.