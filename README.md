# Velour

> A premium creator workspace for capturing ideas, crafting stronger hooks, and publishing faster.

---

## Overview

Velour is a React + TypeScript SaaS-style platform for creators with a polished workflow for ideation, hook crafting, scheduling, sharing, and creator discovery.

The product has two main surfaces:

- **Landing page** at `/` for product marketing and conversion
- **Authenticated app** for creation, publishing workflow, and community discovery

---

## What’s Implemented

### Marketing + Landing

- Premium dark-mode SaaS landing page
- Animated hero (aurora, spotlight, rotating headline)
- Creator platform logo strip
- Before/after comparison section
- Social proof and real-time style activity feed
- Live hook demo preview
- Pricing cards and beta capture section

### Authentication + Account

- Supabase auth with Google and GitHub
- Protected routes with session-based redirects
- Profile management:
  - display name editing
  - avatar upload
  - password update (email provider)
  - logout flow
- Billing management access for paid plans

### Core Idea Workflow

- Create, edit, and delete ideas
- Structured fields: title, tags, hook, insight, twist, cta
- Hook templates + hook strength scoring
- Drag-and-drop idea organization
- Post previews (Twitter + LinkedIn)
- Command palette shortcuts
- Autosave behavior and toast feedback

### Premium Creator Features

- Advanced hook analytics panel (Creator)
- Content Calendar with weekly scheduling (Creator)
- Creator Early Access badge across key surfaces
- Shareable hook cards (copy/share/download image)

### Viral Hooks Library

- Community hooks list with sections:
  - Trending (most copied)
  - Top (most liked)
  - Recent (latest)
- Save hook from idea editor to library
- Copy count tracking
- Like flow with duplicate-like guard

### Creator Discovery + Public Profiles

- Creators discovery page at `/creators`
- Public creator profile route: `/creator/:username`
- Follow/unfollow system
- Public creator metrics:
  - total hooks
  - total likes
  - total copies
  - followers
  - velour plan
- Profile shortcut to “View my Creator Profile”

### Billing (Stripe)

- Checkout session for paid plan upgrades
- Billing portal session endpoint
- Stripe webhook to sync subscription state

---

## App Routes

- `/` → Landing page
- `/login` / `/register` / `/forgot-password` / `/logout`
- `/app` (dashboard)
- `/profile`
- `/pricing`
- `/library`
- `/calendar`
- `/creators`
- `/creator/:username`

---

## Tech Stack

| Layer     | Technology    |
| --------- | ------------- |
| UI        | React 18      |
| Language  | TypeScript    |
| Bundler   | Vite          |
| Styling   | Tailwind CSS  |
| Motion    | Framer Motion |
| State     | Zustand       |
| Router    | React Router  |
| Auth + DB | Supabase      |
| Billing   | Stripe        |
| Backend   | Express       |

---

## Environment Variables

Create [.env.local](.env.local):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx

APP_URL=http://localhost:5173
API_PORT=4242

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx
```

> Never expose Supabase secret/service-role keys in frontend code.

---

## Supabase Setup

### 1) Authentication Providers

Enable:

- Google
- GitHub

Set:

- **Site URL**: `http://localhost:5173`
- **Redirect URL**: `http://localhost:5173/app`

### 2) Database SQL (Run in this order)

1. [supabase/ideas.sql](supabase/ideas.sql)
2. [supabase/profiles.sql](supabase/profiles.sql)
3. [supabase/hooks_library.sql](supabase/hooks_library.sql)
4. [supabase/creator_profiles.sql](supabase/creator_profiles.sql)
5. (Optional) [supabase/backfill_creator_profiles_plan.sql](supabase/backfill_creator_profiles_plan.sql)

The optional backfill script is useful when `creator_profiles.plan` must be corrected for previously created profiles.

---

## Stripe Setup

1. Create product/price in Stripe (monthly)
2. Set `STRIPE_PRO_PRICE_ID`
3. Set `STRIPE_SECRET_KEY`
4. Start webhook forwarding:

```bash
stripe listen --forward-to http://localhost:4242/api/stripe-webhook
```

5. Copy the generated signing secret to `STRIPE_WEBHOOK_SECRET`

---

## Local Development

```bash
# install dependencies
npm install

# run web + api server
npm run dev

# production build check
npm run build
```

---

## Project Structure (High-Level)

```text
src/
├── components/
├── context/
├── data/
├── lib/
├── pages/
│   ├── LandingPage.tsx
│   ├── Profile.tsx
│   ├── Pricing.tsx
│   ├── Library.tsx
│   ├── Calendar.tsx
│   ├── Creators.tsx
│   └── CreatorProfile.tsx
├── store/
├── types/
├── utils/
├── App.tsx
└── main.tsx

supabase/
├── ideas.sql
├── profiles.sql
├── hooks_library.sql
├── creator_profiles.sql
└── backfill_creator_profiles_plan.sql

server/
├── env.js
├── index.js
└── supabaseAdmin.js
```

---

## Current Status

- [x] Landing and marketing surface
- [x] Supabase auth + protected app routes
- [x] Creator-focused idea workflow
- [x] Premium analytics/calendar/sharing surfaces
- [x] Viral hooks library with likes/copies
- [x] Public creator profiles + discovery + follow system
- [x] Stripe checkout + webhook + billing portal support

---

## License

MIT
