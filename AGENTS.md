# AGENTS.md — Chill.me

Single source of truth for autonomous and human agents working in this repository.

## Project overview

Chill.me is a real-time video meeting web app. Authenticated users create LiveKit rooms, join via shareable URLs, use in-call audio/video/chat controls, and review past meetings (including recordings when available). Firebase handles auth and persistence; Stripe server actions exist for a credits-based payment model that is not yet wired into the UI.

**License:** GNU AGPL-3.0. Network deployments of modified versions must provide corresponding source to users.

## Product purpose

Deliver low-friction video meetings: sign in, start a room, share a link, collaborate with chat, and revisit session history. Longer-term product direction (credits, AI features) is documented in [`spec.md`](spec.md).

## Current tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19, TypeScript 6 |
| Styling | Tailwind CSS v4, Radix UI primitives, `next-themes` |
| State | Zustand 5 (`useAuthStore`, `useMeetingStore`) |
| Video | LiveKit (`livekit-client`, `@livekit/components-react`, `livekit-server-sdk`) |
| Auth | Firebase Auth (email/password, Google popup, password reset, email link sign-in) |
| Database | Firestore (client SDK for user writes/reads; Admin SDK for webhooks/server) |
| Storage | Firebase Storage (recording playback URLs) |
| Payments | Stripe server actions only (`createPaymentIntent`, `validatePaymentIntent`) |
| Package manager | **npm** (`package-lock.json`, lockfileVersion 3) — do not switch |

## Repository structure

```
src/
├── app/                         # Routes (App Router)
│   ├── api/webhook/livekit/     # LiveKit webhook (room_finished, egress_ended)
│   ├── auth/                    # signin, signup, signout, forgot-password, verify-email
│   ├── live/                    # Create meeting + /live/[roomId] room
│   ├── past-meetings/           # Host meeting history
│   ├── profile/                 # Basic profile display
│   ├── recording/               # Video.js playback for recordings
│   ├── privacy/, terms/         # Legal pages
│   └── layout.tsx               # ThemeProvider + AuthGuard + shell layout
├── frontend/
│   ├── components/              # UI, forms, meeting features
│   ├── hooks/                   # useAuth, useMeeting, useToast
│   ├── zustand/                 # Global client state
│   ├── services/                # Client modules + "use server" actions (broadcasting, payment, meeting client ops)
│   ├── providers/               # ThemeProvider, LiveKitRoomWrapper
│   ├── layout/                  # Navbar, ContentWrapper
│   └── lib/firebase.ts          # Client Firebase init
├── backend/
│   ├── services/                # Server-only: meeting updates, auth lookup, storage upload helper
│   └── lib/firebase.ts          # Firebase Admin init
├── types/                       # entities.d.ts, firestore-models.d.ts, user.d.ts
└── utils/                       # cn(), dates, room codes, Stripe subcurrency
```

### Path aliases

```typescript
@/*          → ./src/*
@chill-ui    → ./src/frontend/components/ui
@frontend/*  → ./src/frontend/*
@backend/*   → ./src/backend/*
```

## Core architecture overview

```
Browser (client components)
  ├── AuthGuard → Firebase onAuthStateChanged → Zustand useAuthStore
  ├── Create meeting → createRoom (server action) → saveMeeting (Firestore client)
  └── Join /live/[roomId] → getJoinToken → getAccessToken (server) → LiveKitRoomWrapper → useMeeting

LiveKit Cloud
  └── Webhook POST /api/webhook/livekit → updateMeeting (Admin Firestore)
```

**Server/client split (actual, not idealized):**

- `"use server"` lives in `src/frontend/services/broadcasting.ts`, `payment.ts`, `user.ts` and `src/backend/services/*`.
- Client Firestore writes: `src/frontend/services/meeting.ts` (`saveMeeting`, `listUserMeetings`).
- Server Firestore writes: `src/backend/services/meeting.ts` (webhook-driven updates).
- There is **no** Next.js middleware; route protection is client-side only via `AuthGuard`.

## Key features that exist today

| Feature | Status | Primary files |
|---------|--------|-----------------|
| Email/password + Google sign-in | Working | `useAuth.ts`, `AuthForm.tsx`, `SignupForm.tsx` |
| Password reset | Working | `ForgotPasswordForm.tsx` |
| Email link sign-in | Working | `verify-email/page.tsx`, `auth.ts` |
| Create LiveKit room | Working | `CreateMeetingForm.tsx`, `broadcasting.ts` |
| Join room (auth required) | Working | `room-client.tsx`, `useMeeting.ts` |
| Audio/video toggles | Working | `MeetingControls.tsx`, `useMeeting.ts` |
| Host end / guest leave | Working | `useMeeting.ts` (data message + disconnect) |
| In-meeting chat | Working | `MeetingChatWidget.tsx`, LiveKit `useChat` |
| Copy meeting URL | Working | `MeetingControls.tsx` |
| Past meetings list | Working (completed sessions only) | `PastMeetings.tsx`, `listUserMeetings` filters `session_duration` |
| Recording toggle UI | Partial | Toggle sets room metadata only; egress not started; `recording_info` not saved on create |
| Recording playback | Partial | Webhook + `MeetingCard` + `/recording`; depends on egress + Firebase Storage path |
| Stripe credits | Backend only | `payment.ts` — no purchase UI in profile |
| Profile | Minimal | Name, email, uid only |

## Important commands

```bash
npm ci              # Reproducible install (preferred)
npm run dev         # Dev server (deletes .next first)
npm run build       # Production build
npm start           # Production server
npm run lint        # ESLint (flat config: eslint.config.mjs)
npm run eslint:fix  # Auto-fix ESLint issues
npm run tslint      # TypeScript check (tsc, no emit)
```

## Canonical validation command

Run before committing on `dev`:

```bash
npm run lint && npm run tslint && npm run build
```

There is **no** test runner configured (`npm test` does not exist).

## Non-interactive testing rules

- Never use watch mode (`--watch`).
- Never open a headed browser or require manual login for validation.
- Use CI-safe commands only; all commands above are non-interactive.
- Do not rely on `.env` secrets being present for `lint`/`tslint`; `build` requires valid env for Firebase Admin and LiveKit at compile/runtime boundaries — document failures clearly if env is missing locally.
- Manual meeting verification (two browsers, camera) is out of scope for autonomous runs unless explicitly requested.

## Development conventions

- **Components:** PascalCase (`MeetingCard.tsx`)
- **Hooks:** `use` prefix (`useMeeting.ts`)
- **Services:** camelCase (`broadcasting.ts`)
- **Types:** kebab-case `.d.ts` in `src/types/`
- **Styling:** Tailwind + `cn()` from `@/utils/classUtils`; dark mode via `next-themes` (class strategy)
- **UI imports:** prefer `@chill-ui` barrel for shared primitives
- **Forms:** `react-hook-form` for auth flows
- **Minimal diffs:** one focused, PR-sized change per autonomous run

## TypeScript and lint expectations

- `strict: true` in `tsconfig.json`
- ESLint 10 flat config with `@typescript-eslint/recommended`, Next.js core-web-vitals, Prettier integration
- Husky pre-commit runs `npx lint-staged` (no `lint-staged` config block in `package.json` as of this writing — staged files may not run custom rules)
- Fix lint/type errors you introduce; do not drive large unrelated lint sweeps

## Server/client boundary guidance

| Pattern | Where | Rule |
|---------|-------|------|
| Server Actions | `"use server"` in services | LiveKit tokens, Stripe, Admin Firestore reads |
| Client components | `"use client"` on interactive UI | Hooks, Zustand, Firebase Auth, LiveKit room context |
| Server Components | Default in `app/` | Prefer for static shells; meeting UI is client-heavy |
| Calling server actions from client | `broadcasting.ts`, `getAccessToken` | Allowed; Next.js serializes results |
| Firebase client SDK | `frontend/lib/firebase.ts` | Auth, Firestore user queries, Storage download URLs |
| Firebase Admin | `backend/lib/firebase.ts` | Webhooks, `getUserById`, storage upload helper |

**Do not** import Admin SDK or secret env vars into client components.

## Route-protection guidance

`AuthGuard` (`src/frontend/components/AuthGuard.tsx`) wraps the entire app in `layout.tsx`.

**Public routes (no auth):** `/`, `/auth/signin`, `/auth/signup`, `/auth/signout`, `/auth/forgot-password`, `/auth/verify-email`, `/terms`, `/privacy`

**Protected routes:** everything else, including `/live`, `/live/[roomId]`, `/past-meetings`, `/profile`, `/recording`

Behavior:

- Unauthenticated users on protected routes → redirect to `/auth/signin`
- Authenticated users on `/auth/*` → redirect to `/live`
- 5s auth timeout if Firebase does not respond

There is no server-side session verification on API routes beyond LiveKit webhook signature checks.

## State-management guidance

- **`useAuthStore`:** Firebase `User`, `isAuthenticating`. Updated by `useAuth.checkAuthState`.
- **`useMeetingStore`:** Pre-join and in-call UI state (`mediaStatus`, `showChatWidget`). Safe outside LiveKit context.
- **`useMeeting`:** Requires `LiveKitRoomWrapper`. Provides peers, toggles, chat, leave/end.
- Prefer Zustand for cross-route client state; do not add Redux or Context for the same concerns.

## Testing expectations

No Jest/Vitest/Playwright setup. Definition of done for code changes:

1. `npm run lint && npm run tslint && npm run build` pass
2. Change is scoped and manually reasoned against affected user flows
3. Do not add test infrastructure unless `spec.md` milestone or user explicitly requests it

## Files and systems requiring extra caution

| Area | Risk |
|------|------|
| `src/backend/lib/firebase.ts` | `FIREBASE_PRIVATE_KEY` newline handling; breaks all Admin ops |
| `src/frontend/services/broadcasting.ts` | LiveKit token grants (`roomAdmin` = host); maxParticipants currently 20 |
| `src/app/api/webhook/livekit/route.ts` | Production meeting duration + recording metadata |
| `.env` / secrets | Never commit; see `.env.example` |
| `src/frontend/services/meeting.ts` | Client-side Firestore — security rules must enforce ownership |
| `uploadRecordingToStorage` | Exists in `backend/services/storage.ts` but is unused; recording path may be inconsistent |
| `src/types/firestore-models.d.ts` | Legacy 100ms-shaped fields; do not assume runtime shape matches types |
| AGPL license | Network use obligations for modified deployments |

## Git workflow expectations

| Branch | Role |
|--------|------|
| `main` | Stable production — **never push directly from autonomous runs** |
| `dev` | Autonomous working branch — commit and push here |

Workflow for agents:

1. `git fetch origin`
2. `git checkout dev`
3. `git pull origin dev`
4. Make one focused change
5. Run canonical validation
6. Commit to `dev`
7. `git push origin dev`
8. **Do not** open PRs or merge to `main` unless explicitly instructed

Commit messages: concise, imperative, describe *why* when non-obvious.

## Definition of done

- [ ] On branch `dev`, synced with `origin/dev`
- [ ] One focused, PR-sized change (even when committing directly to `dev`)
- [ ] `npm run lint && npm run tslint && npm run build` pass (or documented env blocker)
- [ ] No secrets committed
- [ ] Server/client boundaries respected
- [ ] User-visible behavior matches `spec.md` intent when touching product flows
- [ ] Pushed to `origin/dev` when task requires delivery

## Rules for autonomous Codex runs

1. Read `AGENTS.md` and [`spec.md`](spec.md) before coding.
2. Infer behavior from code, not stale docs.
3. One milestone or fix per run — no bundled refactors.
4. Prefer extending existing patterns over new abstractions.
5. Do not switch package managers or upgrade major deps without explicit approval.
6. Do not modify `.next/` or other generated output.
7. Do not push to `main`.
8. Do not open PRs unless explicitly asked (even though human workflow may later promote `dev` → `main`).

## Stop conditions

Stop and report without committing if:

- Working tree has uncommitted changes you did not create and cannot safely preserve
- `git pull origin dev` produces conflicts you cannot resolve with high confidence
- Build fails due to missing secrets and the task requires runtime verification
- Task scope expands beyond a single PR-sized unit — document remaining work in `spec.md` instead
- Firebase, LiveKit, or Stripe dashboard changes are required (document manual steps)

## Product and planning docs

- **Product spec and roadmap:** [`spec.md`](spec.md)
- **Human install/contributor guide:** [`README.md`](README.md)
- **Legacy pointers:** `upcoming-features.md`, `MIGRATION_PLAN_LIVEKIT.md` redirect to `spec.md`
