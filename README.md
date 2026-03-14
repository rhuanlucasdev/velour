# Velour

> A premium creator workspace for capturing ideas, crafting stronger hooks, and publishing faster.

---

## Overview

Velour is a React + TypeScript SaaS-style app for creators who want a polished workflow for ideation and content development. The project now includes a premium marketing landing page, protected app access with Supabase authentication, and persistent idea storage per user.

The experience is split into two main surfaces:

- **Landing page** at `/` for product marketing and conversion
- **Authenticated app** at `/app` for managing content ideas

---

## Current Features

### Landing Page

- Premium dark-mode SaaS landing page
- Animated hero with aurora, spotlight, and rotating headline word
- Creator platform logo strip
- “Before vs After Velour” comparison section
- Social proof and fake real-time activity feed
- Live hook generation demo
- Pricing section and beta email capture card
- Glassmorphism UI, subtle motion, and high-end visual polish

### Authenticated App

- Supabase authentication with:
  - Google login
  - GitHub login
- Protected `/app` route
- Sidebar with authenticated user avatar
- Logout flow
- Pro upgrade CTA via Stripe Checkout

### Ideas Workflow

- Create, edit, and delete ideas
- Structured idea fields:
  - title
  - tags
  - hook
  - insight
  - twist
  - cta
- Hook templates
- Hook strength indicator
- Post preview modal
- Drag-and-drop idea board
- Command palette shortcuts

### Data Persistence

- Ideas stored in Supabase database
- Row Level Security enabled
- User isolation by `user_id`
- Dashboard loads ideas from Supabase on login
- Local UI state synced with remote database updates

### Billing (Stripe)

- Subscription checkout for Velour Pro (`$10/month`)
- API endpoint: `POST /api/create-checkout-session`
- Stripe webhook endpoint: `POST /api/stripe-webhook`
- Subscription status synced to Supabase `profiles.is_pro`

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
| Auth + DB | Supabase      |

---

## Environment Variables

Create a local env file at [.env.local](.env.local):

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

> Do not expose Supabase `sb_secret` keys in the frontend.

---

## Supabase Setup

### 1. Authentication

Configure these providers in Supabase:

- Google
- GitHub

Set:

- **Site URL**: `http://localhost:5173`
- **Redirect URL**: `http://localhost:5173/app`

### 2. Database

Run the SQL in [supabase/ideas.sql](supabase/ideas.sql) inside the Supabase SQL Editor.

This creates:

- `ideas` table
- index for `user_id` + `created_at`
- RLS policy restricting access to each user's own ideas

Then run [supabase/profiles.sql](supabase/profiles.sql) to create billing profile state.

This creates:

- `profiles` table
- `is_pro` flag
- Stripe customer/subscription IDs
- RLS policies for profile access

---

## Stripe Setup

1. Create a product in Stripe (Velour Pro)
2. Create a recurring monthly price (`$10/month`)
3. Copy `price_...` into `STRIPE_PRO_PRICE_ID`
4. Use test secret key (`sk_test_...`) in `STRIPE_SECRET_KEY`
5. Start local webhook forwarding:

```bash
stripe listen --forward-to http://localhost:4242/api/stripe-webhook
```

6. Copy generated `whsec_...` into `STRIPE_WEBHOOK_SECRET`

Test card:

- `4242 4242 4242 4242`
- any future date
- any CVC

---

## Getting Started

```bash
# install dependencies
npm install

# start web + api server
npm run dev

# build for production
npm run build
```

Then:

1. Add Supabase env vars
2. Configure Google and GitHub auth providers
3. Run the SQL from [supabase/ideas.sql](supabase/ideas.sql)
4. Run the SQL from [supabase/profiles.sql](supabase/profiles.sql)
5. Configure Stripe product/price/webhook

---

## Project Structure

```text
src/
├── components/
│   ├── auth/
│   │   └── LoginModal.tsx
│   ├── command/
│   │   └── CommandPalette.tsx
│   ├── ideas/
│   │   ├── EmptyState.tsx
│   │   ├── HookBlock.tsx
│   │   ├── HookStrengthIndicator.tsx
│   │   ├── HookTemplatePicker.tsx
│   │   ├── IdeaExpansionModal.tsx
│   │   ├── TagInput.tsx
│   │   └── TagPill.tsx
│   ├── preview/
│   │   ├── LinkedInPreview.tsx
│   │   ├── PostPreviewModal.tsx
│   │   └── TwitterPreview.tsx
│   ├── ui/
│   │   ├── AuroraBackground.tsx
│   │   ├── AutosaveIndicator.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   ├── GridBackground.tsx
│   │   ├── SectionHeader.tsx
│   │   └── ToastProvider.tsx
│   ├── AppLayout.tsx
│   ├── Dashboard.tsx
│   ├── IdeaCard.tsx
│   ├── LiveActivityFeed.tsx
│   ├── LiveHookDemo.tsx
│   └── Sidebar.tsx
├── context/
│   └── AuthContext.tsx
├── data/
│   └── hookTemplates.ts
├── lib/
│   └── supabase.ts
├── pages/
│   └── LandingPage.tsx
├── store/
│   ├── ideaStore.ts
│   └── toastStore.ts
├── types/
│   └── idea.ts
├── utils/
│   ├── calculateHookScore.ts
│   └── toast.ts
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts

supabase/
├── ideas.sql
└── profiles.sql

server/
├── env.js
├── index.js
└── supabaseAdmin.js
```

---

## Product Status

Already implemented:

- [x] Premium landing page
- [x] Auth with Supabase
- [x] Google login
- [x] GitHub login
- [x] Persistent ideas with Supabase
- [x] Row Level Security for ideas
- [x] Create / edit / delete ideas
- [x] Hook templates and previews
- [x] Drag-and-drop dashboard
- [x] Stripe subscription checkout
- [x] Pro status sync via webhook

Possible next steps:

- [ ] Persist idea ordering in database
- [ ] Realtime sync across tabs/devices
- [ ] Team/shared workspaces
- [ ] AI-assisted writing features
- [ ] Billing / subscriptions

---

## License

MIT
