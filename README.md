# Chill.me

Real-time video meetings with LiveKit: create a room, share a link, chat in-call, optionally record, and review past sessions. Live site: [https://chill.me](https://chill.me)

## Features

Verified from the current codebase:

- **Create / join meetings** — host from `/live`, guests join via `/live/[roomId]`
- **LiveKit A/V** — camera/mic controls, participant grid, LiveKit React components
- **In-call chat** — meeting chat sidebar/widget
- **Recording** — optional recording; webhook updates Firestore; playback via Video.js at `/recording`
- **Past meetings** — history with duration and recording links at `/past-meetings`
- **Auth** — Firebase Auth (email/password, Google, forgot password, verify email, session cookie API)
- **Profile** — user profile; optional Stripe credit purchases for premium features
- **Legal** — `/privacy`, `/terms`

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI, Lucide, CVA |
| Language | TypeScript 6 |
| Realtime A/V | LiveKit (`livekit-client`, `livekit-server-sdk`, `@livekit/components-react`) |
| Auth / DB / Storage | Firebase 12 + firebase-admin 14 |
| Payments | Stripe (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`) |
| Forms | react-hook-form |
| State | Zustand 5 |
| Theming | next-themes |
| Video playback | video.js |
| Tests | Vitest 4 |
| Lint / format | ESLint 10, Prettier, Husky + lint-staged |
| Node (CI) | 22 |

`.npmrc` sets `legacy-peer-deps=true`.

## Project structure

```
chillmeapp/
├── src/
│   ├── app/                 # Routes + API (auth session, LiveKit webhook)
│   ├── frontend/            # UI, hooks, zustand, client services
│   ├── backend/             # Server services (auth, meetings, storage, user/credits)
│   ├── types/, utils/
├── .env.example
├── docs/runtime-budget.md
└── .github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Firebase project (Auth, Firestore, Storage)
- LiveKit Cloud (or self-hosted) project
- Stripe account (optional; for credit purchases)

### Install

```bash
git clone https://github.com/brown2020/chillmeapp.git
cd chillmeapp
git checkout dev
npm install
cp .env.example .env.local
# fill in values — never commit secrets
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run tunnel` opens an SSH tunnel via serveo for webhook/device testing (`chillme` → localhost:3000).

## Environment variables

Names match `.env.example` and code (`NEXT_PUBLIC_FIREBASE_*` use the compacted spellings below).

| Name | Purpose | Where to get it |
|------|---------|-----------------|
| `NEXT_PUBLIC_BASE_URL` | Public site URL | You (e.g. `http://localhost:3000`) |
| `LIVEKIT_API_KEY` | LiveKit server API key | LiveKit Cloud → Settings → Keys |
| `LIVEKIT_API_SECRET` | LiveKit server API secret | Same |
| `LIVEKIT_URL` | LiveKit WebSocket URL (server) | LiveKit project URL (`wss://…`) |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit URL for the browser | Same as above |
| `FIREBASE_PROJECT_ID` | Admin SDK project ID | Service account JSON |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK client email | Same |
| `FIREBASE_PRIVATE_KEY` | Admin SDK private key | Same |
| `FIREBASE_TYPE`, `FIREBASE_PRIVATE_KEY_ID`, `FIREBASE_CLIENT_ID`, `FIREBASE_AUTH_URI`, `FIREBASE_TOKEN_URI`, `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`, `FIREBASE_CLIENT_CERTS_URL`, `FIREBASE_UNIVERSE_DOMAIN` | Extra service-account fields listed in `.env.example` | Service account JSON |
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Firebase web API key | Firebase Console → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Auth domain | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Project ID | Same |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Storage bucket | Same |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Messaging sender ID | Same |
| `NEXT_PUBLIC_FIREBASE_APPID` | App ID | Same |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Analytics measurement ID | Same (optional) |
| `NEXT_PUBLIC_COOKIE_NAME` | Client auth cookie name (default pattern `chillmeAuthToken`) | You |
| `AUTH_SESSION_COOKIE_NAME` | Optional server session cookie name override | Optional |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key | Stripe Dashboard |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` | Stripe product/price lookup name | Stripe product config |
| `NEXT_PUBLIC_CREDITS_PER_IMAGE` | Credits packaging helper used by CI/config | You |

Point LiveKit webhooks at `/api/webhook/livekit` on your deployed base URL.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Clear `.next` and start Next.js dev |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` / `eslint` | ESLint |
| `npm run eslint:fix` | ESLint with `--fix` |
| `npm run tslint` | `tsc` typecheck |
| `npm test` | Vitest |
| `npm run tunnel` | Serveo SSH tunnel for local webhooks |
| `npm run prepare` | Husky install |

## Testing and CI

Vitest covers utils (auth routes, credits config, dates, meeting password, recording paths).

GitHub Actions (`.github/workflows/ci.yml`) on `dev` / `main` and PRs: `npm ci --ignore-scripts` → `tslint` → test → build (with `NEXT_PUBLIC_*` secrets injected only on the build step). Node 22.

## Deployment

Deploy as a Next.js app (e.g. Vercel) to [https://chill.me](https://chill.me). Configure LiveKit webhooks and all env vars in the host. Stripe is optional; the profile UI shows credits purchase as unavailable when Stripe is not configured.

## Contributing

- `main` — production
- `dev` — integration

See [AGENTS.md](./AGENTS.md) and [spec.md](./spec.md). Branch from `dev`. Husky runs lint-staged on commit.

## License

[GNU Affero General Public License v3](./LICENSE.md) (AGPL-3.0).
