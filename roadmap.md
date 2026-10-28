# Chill.me — Roadmap

Punchlist after the current `dev` tree. The shipped behavior is [`spec.md`](spec.md).

## Needs a person, not a code change

- **Firestore and Storage rules.** The live Firebase project `chilldotme` is still in test mode and open until Dec 16, 2026. This repo has no rules files. Replace test mode with rules that let a user read and write only their own `users` doc and only their own `meeting_sessions`, and that do not expose `password_hash`. Do that in the Firebase console or a reviewed rules deploy. Do not leave test mode in place past that date.
- **Node runtime vs Firebase JS SDK 13.** The SDK declares Node `>=24.12.0`. CI and local validation use Node 22, and the production build currently passes there. Confirm the Vercel Node version before that engine requirement becomes a hard failure.
- **Stripe webhook secret.** Set `STRIPE_WEBHOOK_SECRET` on the host and point Stripe at `POST /api/webhook/stripe` if charges should be reconciled when the browser never calls `completeCreditsPurchase`. Checkout still works without it.
- **LiveKit egress.** Recording stays incomplete until egress is enabled for the LiveKit project. The app already starts it when the host opts in.

## Do not upgrade yet

- **TypeScript 7.** `typescript-eslint` still requires the TypeScript 6 compiler API. TypeScript 7 has no JavaScript API, so ESLint cannot load it. Stay on TypeScript 6.
- **video.js 10.** The `video.js` 10 package is a different player and does not accept `videojs()`. Playback stays on video.js 8 until someone rewrites `VideoPlayer`.

## Product

- **Lock a meeting.** Host control that rejects new tokens while people already inside stay connected.
- **Spend credits.** `room_finished` should deduct credits, and room creation should stop with a clear message when the balance is too low. Profile should show recent deductions.
- **Credit packages.** One package is hard-coded today. Add more amounts only with server-side prices, not a client-supplied amount.
- **Rotate a meeting password** after the room exists.
- **Profile edits.** No photo, display-name edit, or account deletion yet.
- **Guest name.** A guest display name is not saved across reconnects.
- **Post-call transcript.** Not built. Do not add a model id until this is a real feature with a credit cost shown first.

## Known limits

- Join rate limits live in each server process, not across all instances.
- Recording downloads check DNS, then the HTTP client resolves the host again, so a rebinding answer can still differ. Redirects stay off.
- An old `meeting_sessions` row with an automatic id can still be chosen when no document id matches the room id. New rooms use the room id as the document id.
- Admin SDK calls fail at runtime when credentials are missing. The process does not crash at import time, so a build can succeed without them.
- Past meetings only include rows that already have `session_duration`.
- In-call chat is on screen at small widths. It is not a separate touch drawer, and control hit targets have not been measured.
- There is no browser or end-to-end test runner. Unit tests cover the security-sensitive helpers and room ids.
