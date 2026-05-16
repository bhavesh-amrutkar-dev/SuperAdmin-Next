This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Starteddd

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More here

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Donrifa_Web_revamp

# DonRifa — Customer Website

A production-grade, multi-language customer-facing web application for the DonRifa raffle platform. Built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS v4**, it supports multi-currency payments, ticket wallets, user authentication, and real-time order tracking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, CSS custom properties |
| **UI Primitives** | Radix UI (20+ components), CVA, Tailwind Merge |
| **Forms & Validation** | React Hook Form + Zod |
| **State Management** | React Context API + custom hooks |
| **HTTP Client** | Axios with request/response interceptors |
| **Authentication** | Custom cookie-based JWT (no NextAuth) |
| **Payments** | Square, Stripe, Razorpay, PlaceToPay, RakBank |
| **Analytics** | Firebase, Google Analytics, Meta Pixel, Airbridge, Branch |
| **Internationalization** | next-intl (cookie-based locale) |
| **Animations** | Framer Motion, Tailwind Animate |
| **Deploymegitnt** | Docker → AWS CodeBuild → ECR → ECS |

---

## Features

- **Raffle System** — Browse, filter, and purchase raffle tickets with live inventory
- **Multi-Currency Checkout** — Square, Stripe, Razorpay, PlaceToPay, RakBank support
- **Ticket Wallet** — Manage purchased raffle tickets
- **User Authentication** — Email + mobile OTP login, sign-up, password reset
- **Order Management** — Full order history and status tracking
- **Address Book** — Save and manage multiple delivery addresses
- **Multi-Language Support** — next-intl with cookie-based locale switching
- **IP-Based Country Detection** — Auto-detects country for currency and language defaults
- **Real-Time Notifications** — MQTT WebSocket integration
- **Analytics & Attribution** — Firebase, GA4, Meta Pixel, Airbridge, Branch deep links
- **SEO Optimised** — Server-side rendering, security headers, canonical routes
- **Responsive Design** — Mobile-first Tailwind CSS layout

---

## Folder Structure

```
customer-website-nextjs/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── providers.tsx           # Client-side context providers
│   │   ├── globals.css             # Tailwind base + global styles
│   │   ├── page.tsx                # Homepage
│   │   ├── (auth)/                 # Auth pages: login, signup, forgot-password
│   │   ├── profile/                # Protected: user profile
│   │   ├── orders/                 # Protected: order history
│   │   ├── addresses/              # Protected: address book
│   │   ├── raffles/                # Raffle listings & detail pages
│   │   ├── cart/                   # Shopping cart
│   │   ├── payments/               # Payment flow
│   │   ├── contact/                # Contact form
│   │   ├── about/                  # About page
│   │   └── api/                    # Next.js API routes (login, OTP, etc.)
│   │
│   ├── components/
│   │   ├── ui/                     # Shadcn-style Radix UI primitives
│   │   ├── common/                 # Shared components (CountrySelect, EmptyState…)
│   │   ├── layout/                 # Header, Footer, Navigation
│   │   ├── checkout/               # Checkout flow components
│   │   ├── payments/               # Payment provider components (Square, etc.)
│   │   ├── raffle-detail/          # Raffle detail page sections
│   │   ├── landing/                # Homepage sections
│   │   ├── modals/                 # Modal components
│   │   └── express/                # Express checkout components
│   │
│   ├── context/
│   │   ├── authContext.tsx         # Auth state: user, token, login/logout helpers
│   │   └── countryContext.tsx      # Country, currency, language state
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   └── axios.ts            # Axios clients: apiClient, pyApiClient, pyApiClientRoot
│   │   ├── services/               # Business logic layer (25+ service files)
│   │   │   ├── auth.ts             # Authentication service
│   │   │   ├── cart.ts             # Cart operations
│   │   │   ├── order.ts            # Order management
│   │   │   ├── payment.ts          # Payment processing
│   │   │   ├── raffles.ts          # Raffle listings & details
│   │   │   └── ...                 # address, blog, country, guest, ticket…
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/                  # Helpers: IP resolution, device info, formatters
│   │   ├── mappers/                # API response → domain model transforms
│   │   ├── filters/                # List filtering logic
│   │   ├── security/               # MD5 hash, token utilities
│   │   ├── session/                # Session cookie helpers
│   │   ├── bootstrap/              # App initialisation (guest setup, locale)
│   │   └── config/                 # Payment gateway configs (Square, Stripe…)
│   │
│   ├── models/
│   │   ├── api/request/            # TypeScript interfaces for request payloads
│   │   └── api/response/           # TypeScript interfaces for API responses
│   │
│   ├── types/                      # Shared TypeScript type definitions
│   ├── i18n/                       # next-intl routing & request configuration
│   ├── messages/                   # Locale message files (en.json, ar.json…)
│   └── middleware.ts               # Route protection for /profile, /orders, /addresses
│
├── public/                         # Static assets
├── Dockerfile                      # Production container build
├── buildspec.yml                   # AWS CodeBuild CI/CD pipeline
├── next.config.ts                  # Next.js config (i18n, image domains, headers)
├── postcss.config.mjs              # PostCSS / Tailwind v4 plugin
├── tsconfig.json
└── package.json
```

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file.**

```env
# ─── Application ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ─── Backend APIs ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_NY_URL=https://api.example.com/
NEXT_PUBLIC_PY_API_URL=https://py-api.example.com/
NEXT_PUBLIC_PY_API_ROOT_URL=https://py-api.example.com/

# ─── Square Payments ───────────────────────────────────────────────────────────
NEXT_PUBLIC_SQUARE_APP_ID_SANDBOX=sandbox-sq0idb-XXXX
NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX=XXXX
NEXT_PUBLIC_SQUARE_APP_ID_PRODUCTION=sq0idp-XXXX
NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION=XXXX
SQUARE_ACCESS_TOKEN=EAAAl_XXXX

# ─── Stripe ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXX

# ─── Razorpay ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_XXXX

# ─── PlaceToPay ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_PLACE_TO_PAY_URL_TEST=https://test.placetopay.com/
NEXT_PUBLIC_PLACE_TO_PAY_URL_PROD=https://checkout.placetopay.com/

# ─── Firebase ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy-XXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:XXXX
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXX

# ─── Analytics ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXX
NEXT_PUBLIC_META_PIXEL_ID=0000000000000000
NEXT_PUBLIC_AIRBRIDGE_APP_NAME=your-app
NEXT_PUBLIC_AIRBRIDGE_WEB_TOKEN=XXXX
NEXT_PUBLIC_BRANCH_KEY=key_live_XXXX
NEXT_PUBLIC_BRANCH_KEY_TEST=key_test_XXXX

# ─── Google Services ───────────────────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_GEOLOCATION_API_KEY=XXXX
NEXT_PUBLIC_GOOGLE_CLIENT_ID=XXXX.apps.googleusercontent.com

# ─── Social Auth ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_FACEBOOK_APP_ID=0000000000000000

# ─── Blog (Ghost CMS) ──────────────────────────────────────────────────────────
NEXT_PUBLIC_GHOST_URL=https://blog.example.com
NEXT_PUBLIC_GHOST_KEY=XXXX

# ─── CDN ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_S3_BUCKET_URL=https://your-bucket.s3.amazonaws.com

# ─── MQTT (Real-time) ──────────────────────────────────────────────────────────
NEXT_PUBLIC_MQTT_HOST=mqtt.example.com
NEXT_PUBLIC_MQTT_PORT=9999
NEXT_PUBLIC_MQTT_USERNAME=mqttuser
NEXT_PUBLIC_MQTT_PASSWORD=mqttpassword

# ─── Defaults ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_DEFAULT_COUNTRY_CODE=AE
NEXT_PUBLIC_DEFAULT_LAT=25.2048
NEXT_PUBLIC_DEFAULT_LNG=55.2708
```

---

## Installation

**Prerequisites**: Node.js 20+, npm 10+

```bash
# 1. Clone the repository
git clone https://github.com/your-org/customer-website-nextjs.git
cd customer-website-nextjs

# 2. Install dependencies (use ci for reproducible installs)
npm ci

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in all required values

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running the Project

```bash
# Development server with hot module replacement
npm run dev

# Production build
npm run build

# Start production server (requires a completed build)
npm start

# Lint the codebase
npm run lint
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts Next.js dev server with HMR on port 3000 |
| `npm run build` | Compiles and optimises the app for production |
| `npm start` | Serves the compiled production build |
| `npm run lint` | Runs ESLint across the entire `src/` directory |

---

## API Integration

### Architecture

The app communicates with two backend services via dedicated Axios clients defined in [src/lib/api/axios.ts](src/lib/api/axios.ts):

| Client | Env Var | Purpose |
|---|---|---|
| `apiClient` | `NEXT_PUBLIC_API_NY_URL` | Primary Node.js REST API |
| `pyApiClient` | `NEXT_PUBLIC_PY_API_URL` | Python microservice API |
| `pyApiClientRoot` | `NEXT_PUBLIC_PY_API_ROOT_URL` | Python API (root-level routes) |

### Request Interceptor

Every outbound request is automatically enriched with:

```
Authorization: Bearer <access_token>
x-language:   <current locale>
x-country:    <detected country code>
x-currency:   <user currency>
x-platform:   web
```

### Response Interceptor

- Unwraps the `data` envelope from all successful responses
- On `401 Unauthorized`: refreshes the `access_token` via `refresh_token` cookie and retries the original request
- On refresh failure: clears session cookies and redirects to `/login`

### Service Layer

All API calls are encapsulated in service files under [src/lib/services/](src/lib/services/). Components import services — never `apiClient` directly.

```
services/
├── auth.ts          → login, signup, OTP, password reset
├── cart.ts          → add/remove/fetch cart items
├── order.ts         → place orders, fetch order history
├── payment.ts       → initiate & verify payments (all gateways)
├── raffles.ts       → raffle listings, detail, ticket availability
├── ticketWallet.ts  → user ticket wallet
├── address.ts       → address CRUD
├── blog.ts          → Ghost CMS blog content
└── ...              → country, guest, contact, rules, support
```

### Protected Routes

[src/middleware.ts](src/middleware.ts) intercepts requests to `/profile`, `/orders`, `/address`, and `/addresses`. Users without a valid `access_token` cookie are redirected to `/login`.

---

## Deployment

### Docker (Local / Self-hosted)

```bash
# Build the image
docker build -t donrifa-customer-web .

# Run the container
docker run -p 6060:6060 --env-file .env donrifa-customer-web
```

The app listens on port **6060** inside the container.

### AWS (Production Pipeline)

The project ships with a [buildspec.yml](buildspec.yml) for **AWS CodeBuild**:

```
Developer Push
     │
     ▼
AWS CodeBuild
  ├── Pre-build  : Login to ECR, fetch .env from AWS Secrets Manager
  ├── Build      : docker build (injects secrets as .env at build time)
  └── Post-build : Push image to ECR, emit imagedefinitions.json
     │
     ▼
AWS ECS  (rolling deployment via imagedefinitions.json)
```

**Required AWS resources:**

- ECR repository for the Docker image
- Secrets Manager secret containing the production `.env` contents
- ECS cluster + service (Fargate or EC2 launch type)
- CodeBuild project connected to this repository

### Vercel (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Set all environment variables in the Vercel project dashboard under **Settings → Environment Variables**.

> Ensure `NEXT_PUBLIC_BASE_URL` reflects the deployed domain before going live.

---

## Contributing

1. **Fork** the repository and create a feature branch off `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add Apple Pay support
   fix: resolve OTP timeout on slow connections
   chore: bump Square SDK to latest
   ```

3. **Code standards:**
   - All new code must be TypeScript with strict types — no `any`
   - Forms must use React Hook Form + Zod for validation
   - API calls must go through the service layer — never call `apiClient` from a component directly
   - Run `npm run lint` and fix all errors before pushing

4. **Pull Request:**
   - Target the `main` branch
   - Provide a clear description, screenshots for UI changes, and link any related issues
   - At least one approval is required before merging

5. **Branch naming conventions:**

   | Prefix | Use case |
   |---|---|
   | `feature/` | New features |
   | `fix/` | Bug fixes |
   | `chore/` | Tooling, dependency updates |
   | `hotfix/` | Urgent production patches |

---

## License

This project is **proprietary and confidential**. Unauthorised copying, distribution, or use of this software is strictly prohibited.

© 2024 DonRifa. All rights reserved.


# SuperAdmin-Next