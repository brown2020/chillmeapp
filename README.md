# Chill.me

Real-time video meetings. Sign in, create a LiveKit room, share the link, chat, optionally record, and review past sessions. Live site: [https://chill.me](https://chill.me)

## Features

- **Create a meeting** at `/live` with camera preview, optional recording, and an optional password (at least 8 characters).
- **Join** at `/live/[roomId]`. Guests enter a display name. Signed-in users join with their account. Protected rooms ask for the password first.
- **In-call controls** for camera, microphone, chat, copy link, guest leave, and host end. Ending the meeting deletes the LiveKit room.
- **Recording** when the host opts in and LiveKit egress storage is configured. Otherwise the create-meeting form explains that recording is not enabled, and the meeting still starts. LiveKit egress is uploaded to Firebase Storage. The host watches it at `/recording` with a short-lived signed URL.
- **Past meetings** at `/past-meetings` for completed sessions (those with a stored duration).
- **Auth** with email/password, Google, password reset, and email-link sign-in. The server session cookie is httpOnly.
- **Profile credits** at `/profile`. Stripe checkout is optional. A fixed credit package is charged server-side.
- **Legal** pages at `/privacy` and `/terms`.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI, Lucide, CVA |
| Language | TypeScript 6 |
| Realtime A/V | LiveKit (`livekit-client`, `livekit-server-sdk`, `@livekit/components-react`) |
| Auth / DB / Storage | Firebase JS SDK 13, firebase-admin 14 |
| Payments | Stripe (`stripe` 23, `@stripe/stripe-js`, `@stripe/react-stripe-js`) |
| Playback | video.js 8 |
| Forms | react-hook-form |
| State | Zustand 5 |
| Theming | next-themes |
| Tests | Vitest 5, Vite 8 |
| Lint / format | ESLint 10, Prettier, Husky, lint-staged |
| Node (CI) | 22 |

`.npmrc` sets `legacy-peer-deps=true`. `firebase-admin` 14 depends on `jwks-rsa` 4, which is overridden to `jose` 5.10.0 so Node can `require` it.

## Project structure

```
chillmeapp/
├── src/
│   ├── app/                 # Routes and API (session, LiveKit webhook, Stripe webhook)
│   ├── frontend/            # UI, hooks, zustand, client services
│   ├── backend/             # Server auth, meetings, storage, credits
│   ├── types/, utils/
├── firestore.indexes.json   # Composite index for past meetings
├── firestore.rules          # Locked-down Firestore rules (not deployed by CI)
├── storage.rules            # Locked-down Storage rules (not deployed by CI)
├── firebase.json            # Rules, indexes, and emulator ports
├── .firebaserc              # Default project chilldotme
├── .env.example             # Env var names
├── spec.md                  # Product spec as built
├── roadmap.md               # Next steps and known gaps
└── .github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 24 or newer
- npm
- A Firebase project with Auth, Firestore, and Storage
- A LiveKit Cloud or self-hosted project
- A Stripe account only if you want credit purchases

### Install

```bash
git clone https://github.com/brown2020/chillmeapp.git
cd chillmeapp
git checkout dev
npm install
cp .env.example .env.local
# fill in .env.local locally — never commit it
npm run dev
```

Open the app at the URL you set for `NEXT_PUBLIC_BASE_URL`.

`npm run tunnel` opens an SSH tunnel via serveo for webhook and device testing.

## Environment variables

Names match `.env.example`. Do not commit values.

| Name | Purpose |
|------|---------|
| `NEXT_PUBLIC_BASE_URL` | Public site URL |
| `LIVEKIT_API_KEY` | LiveKit server API key |
| `LIVEKIT_API_SECRET` | LiveKit server API secret |
| `LIVEKIT_URL` | LiveKit WebSocket URL used on the server |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit URL used in the browser |
| `LIVEKIT_EGRESS_ENABLED` | Optional. `false` hides recording. `true` allows it only with a storage destination below. Unset defers to that destination. |
| `LIVEKIT_EGRESS_S3_ACCESS_KEY`, `LIVEKIT_EGRESS_S3_SECRET`, `LIVEKIT_EGRESS_S3_REGION`, `LIVEKIT_EGRESS_S3_BUCKET` | Optional S3 output for LiveKit egress. `LIVEKIT_EGRESS_S3_ENDPOINT` is optional. |
| `LIVEKIT_EGRESS_GCP_CREDENTIALS`, `LIVEKIT_EGRESS_GCP_BUCKET` | Optional GCP output for LiveKit egress. |
| `LIVEKIT_EGRESS_AZURE_ACCOUNT_NAME`, `LIVEKIT_EGRESS_AZURE_ACCOUNT_KEY`, `LIVEKIT_EGRESS_AZURE_CONTAINER` | Optional Azure output for LiveKit egress. |
| `FIREBASE_TYPE` | Service-account credential type |
| `FIREBASE_PROJECT_ID` | Admin SDK project id |
| `FIREBASE_PRIVATE_KEY_ID` | Service-account private key id |
| `FIREBASE_PRIVATE_KEY` | Service-account private key |
| `FIREBASE_CLIENT_EMAIL` | Service-account client email |
| `FIREBASE_CLIENT_ID` | Service-account client id |
| `FIREBASE_AUTH_URI` | Service-account auth URI |
| `FIREBASE_TOKEN_URI` | Service-account token URI |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | Service-account cert URL |
| `FIREBASE_CLIENT_CERTS_URL` | Service-account client cert URL |
| `FIREBASE_UNIVERSE_DOMAIN` | Service-account universe domain |
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Firebase project id for the web app |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Firebase messaging sender id |
| `NEXT_PUBLIC_FIREBASE_APPID` | Firebase web app id |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Analytics measurement id (optional) |
| `NEXT_PUBLIC_COOKIE_NAME` | Session cookie name |
| `AUTH_SESSION_COOKIE_NAME` | Optional server override for the session cookie name |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key (optional) |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (optional). `POST /api/webhook/stripe` returns 503 and grants nothing until this is set. In-browser checkout can still grant credits. |
| `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` | Stripe product name stored on the PaymentIntent |
| `NEXT_PUBLIC_CREDITS_PER_IMAGE` | Credits granted per purchase. Defaults when unset or invalid. |

Point LiveKit webhooks at `/api/webhook/livekit`. Point Stripe webhooks at `/api/webhook/stripe` when using `STRIPE_WEBHOOK_SECRET`.

Past meetings use the composite index in `firestore.indexes.json` (`meeting_sessions`: `broadcaster` ascending, `created_at` descending). `firestore.rules` and `storage.rules` default-deny and are covered by `npm run test:rules`. This repo does not deploy Firebase rules or indexes.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Delete `.next` and start the Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run eslint:fix` | ESLint with `--fix` |
| `npm run tslint` | Typecheck with `tsc` |
| `npm test` | Vitest unit tests |
| `npm run test:rules` | Firestore and Storage rules against the emulators |
| `npm run tunnel` | Serveo SSH tunnel for local webhooks |
| `npm run prepare` | Install Husky hooks |

## Testing and CI

Vitest covers auth redirects, meeting passwords, host checks, join rate limits, room codes, recording paths, remote download URL checks, credit grants, and terms HTML.

GitHub Actions (`.github/workflows/ci.yml`) runs on `dev`, `main`, and pull requests: `npm ci --ignore-scripts`, typecheck, unit tests, rules emulator tests, then production build. Client `NEXT_PUBLIC_*` values are injected only for the build step. CI uses Node 24.

## Deployment

Deploy the Next.js app to the host that serves [https://chill.me](https://chill.me). Set the env vars there, plus the LiveKit and Stripe webhook URLs. Stripe is optional: the profile page hides checkout when Stripe is not configured.

## Contributing

- `main` — production
- `dev` — integration

See [AGENTS.md](./AGENTS.md), [spec.md](./spec.md), and [roadmap.md](./roadmap.md). Branch from `dev`. Husky runs lint-staged on commit.

## License

[GNU Affero General Public License v3](./LICENSE.md) (AGPL-3.0).
