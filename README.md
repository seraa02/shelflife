# ShelfLife 🛍️

A production-quality e-commerce storefront built as a portfolio project for a Front-End Engineer role. Demonstrates real engineering practice: type-safe component architecture, Zustand state management, JWT-authenticated user flows, and a GitHub Actions CI/CD pipeline.

**Live demo:** _Deploy to Vercel + Render using the instructions below, then add your URL here._

---

## Architecture

```
shelflife/
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # Button, Input, Spinner, ErrorMessage, Badge
│   │   │   ├── layout/     # Header, Footer, Layout (Outlet wrapper)
│   │   │   ├── product/    # ProductCard, ProductGrid, SearchBar, CategoryFilter, Pagination
│   │   │   ├── cart/       # CartItem
│   │   │   └── auth/       # RequireAuth (route guard)
│   │   ├── pages/          # One file per route
│   │   ├── store/          # Zustand slices: cartStore, authStore
│   │   ├── hooks/          # useProducts, useCategories, useDebounce
│   │   ├── lib/            # api.ts (typed fetch wrapper), utils.ts
│   │   └── types/          # Shared TypeScript interfaces
│   └── ...config files
│
├── backend/                # Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/         # auth.ts, products.ts, orders.ts
│   │   ├── middleware/     # auth.ts (JWT requireAuth)
│   │   ├── lib/            # prisma.ts (singleton), jwt.ts
│   │   └── __tests__/      # Supertest integration tests
│   ├── prisma/
│   │   ├── schema.prisma   # User, Category, Product, Order, OrderItem
│   │   └── seed.ts         # Fetches from Fake Store API, stores locally
│   └── ...config files
│
└── .github/workflows/
    ├── ci.yml              # Lint + test on every PR
    └── deploy.yml          # Auto-deploy to Vercel + Render on merge to main
```

### Data flow

```
Browser
  └─ React Router (client-side routing)
       └─ Zustand (cart = localStorage-persisted, auth = server-backed)
            └─ api.ts (typed fetch wrapper, credentials: 'include')
                 └─ Vite dev proxy → Express REST API
                       └─ Prisma ORM → SQLite (dev) / PostgreSQL (prod)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| State Management | Zustand v5 (with `persist` middleware) |
| Styling | Tailwind CSS v3 |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT in httpOnly cookies + bcrypt |
| Validation | Zod (backend) |
| Testing | Vitest + React Testing Library + Supertest |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- npm ≥ 9

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/shelflife.git
cd shelflife
npm install          # installs all workspaces
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env   # edit JWT_SECRET to something long and random
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts # seeds ~44 products from Fake Store API
npm run dev            # starts on http://localhost:3001
```

### 3. Start the frontend

```bash
cd ../frontend
npm run dev            # starts on http://localhost:5173
# Vite proxies /api/* → http://localhost:3001
```

Open [http://localhost:5173](http://localhost:5173).

### Running tests

```bash
# Backend (Supertest integration tests)
cd backend && npm test

# Frontend (Vitest + React Testing Library)
cd frontend && npm test
```

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set Root Directory to `frontend`
4. Add env var: `VITE_API_URL` pointing to your backend URL
5. Deploy — Vercel auto-detects Vite

### Backend → Render

1. Create a new **Web Service** on Render
2. Set Root Directory to `backend`
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `npm start`
5. Add env vars:
   - `DATABASE_URL` — Render PostgreSQL connection string
   - `JWT_SECRET` — long random string
   - `FRONTEND_URL` — your Vercel URL
6. Attach a **PostgreSQL** database add-on

### CI/CD secrets (GitHub → Settings → Secrets)

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | From `vercel.json` or Vercel project settings |
| `VERCEL_PROJECT_ID` | From Vercel project settings |
| `RENDER_DEPLOY_HOOK` | From Render service settings → Deploy Hook |

---

## Features

- **Product catalog** — grid view, category filter, live search with 400ms debounce, pagination
- **Product detail** — full description, quantity selector, stock badges, "Add to cart" with confirmation flash
- **Cart** — persistent via Zustand + `localStorage`, quantity editing, subtotal, free shipping threshold indicator
- **Auth** — register / login / logout, JWT stored in httpOnly cookie (not `localStorage`), protected routes with redirect-back
- **Checkout** — 2-step flow (shipping → review), server-side price validation (client prices are never trusted), transactional stock decrement
- **Order history** — list view with status badges, detail page with shipping address and line items
- **Responsive** — mobile-first, tested at 375 / 768 / 1440px
- **Loading states** — skeleton cards while fetching, spinners on async operations
- **Error states** — inline error messages with retry buttons, no blank screens
- **Accessibility** — semantic HTML, ARIA labels, keyboard navigation, `role="alert"` for errors, `aria-live` for cart count

---

## Design Decisions

### Why Zustand over Redux Toolkit?

Redux Toolkit would be the right call for a larger team or a codebase where actions need to be dispatched from many places. For this scope, Zustand's minimal boilerplate (`set`, `get`, `persist`) maps cleanly to the two stores we actually need (cart, auth). The resulting code is easier to read during a whiteboard review.

### Why SQLite in dev, not PostgreSQL everywhere?

Zero-config local setup. Prisma's schema is identical; only the `datasource` URL changes. For production, swapping to PostgreSQL is a one-line env change. This is the same tradeoff Rails makes with SQLite in dev.

### Why `credentials: 'include'` + httpOnly cookie instead of `Authorization` header?

`localStorage`-stored JWTs are vulnerable to XSS. httpOnly cookies are not readable by JavaScript at all — only the browser sends them. The tradeoff is that CSRF is now a concern, mitigated here by `sameSite: 'lax'` (sufficient for same-origin redirects) and checking `Origin`/`Referer` headers in production.

### Why server-side price validation on checkout?

Never trust the client. The `POST /api/orders` handler re-fetches product prices from the DB and ignores any prices sent in the request body. This is the same pattern used by every real e-commerce backend.

### Why no React Query / SWR?

Deliberate choice for interview explainability. Custom `useProducts` / `useCategories` hooks cover all data-fetching needs without a library, making the fetching logic fully transparent. In a production codebase with dozens of endpoints, React Query would be the right tool.

---

## Resume Bullets

Use whichever of these fit your target role:

> - Built **ShelfLife**, a full-stack e-commerce SPA (React 18 + TypeScript + Zustand + Express + Prisma), featuring JWT auth with httpOnly cookies, a 2-step checkout flow with server-side price validation, and a Zustand cart persisted to `localStorage`.
>
> - Designed a component library (Button, Input, ProductCard, CategoryFilter, Pagination) reused across catalog, search, and detail views; maintained consistent accessibility via semantic HTML, ARIA labels, and keyboard navigation.
>
> - Implemented a GitHub Actions CI/CD pipeline (lint + Vitest + Supertest on every PR; auto-deploy to Vercel + Render on merge to main), writing 13 tests across unit, component, and API integration layers.
>
> - Authored a Prisma seed script that fetches product data from a third-party API, normalises it into a relational schema (User, Category, Product, Order, OrderItem), and stores it locally—eliminating runtime dependency on an external service.
