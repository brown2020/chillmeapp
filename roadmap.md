# Chill.me — Roadmap

Punchlist after the current `dev` tree. The shipped behavior is [`spec.md`](spec.md).

## Needs a person, not a code change

- **Deploy Firestore and Storage rules.** `firestore.rules` and `storage.rules` are committed for project `chilldotme` and covered by emulator tests. They are not deployed from CI. The live project is no longer open: on Nov 12, 2026 it denied client reads of `meeting_sessions`, including a new user's owner-filtered history query, so the deployed rules do not match `firestore.rules`. Past meetings now load through an Admin SDK server action and do not depend on them. Review the committed rules, then deploy them. A host can still read `password_hash` on their own meeting document through the client SDK because rules cannot hide a single field.
- **Node runtime vs Firebase JS SDK 13.** The SDK declares Node `>=24.12.0`. CI uses Node 24. Confirm the Vercel Node version is 24 before that engine requirement becomes a hard failure.
- **Stripe webhook secret.** Set `STRIPE_WEBHOOK_SECRET` on the host and point Stripe at `POST /api/webhook/stripe` if charges should be reconciled when the browser never calls `completeCreditsPurchase`. Checkout still works without it.
- **LiveKit egress.** The recording control stays hidden until a storage destination is configured (`LIVEKIT_EGRESS_S3_*`, `LIVEKIT_EGRESS_GCP_*`, or `LIVEKIT_EGRESS_AZURE_*`). `LIVEKIT_EGRESS_ENABLED=false` forces it off. Meetings still start without it.

## Do not upgrade yet

- **TypeScript 7.** Latest is 7.0.2. `@typescript-eslint` 8.72.1 still requires `typescript >=4.8.4 <6.1.0`. TypeScript 7 has no JavaScript API, so ESLint cannot load it. Stay on TypeScript 6.0.3.
- **video.js 10.** Latest is 10.3.0, and there is no 9.x release. The `video.js` 10 package throws on the Video.js 8 `videojs()` API. Playback stays on video.js 8.24.2 until someone rewrites `VideoPlayer`.

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
- `npm audit` still reports moderate issues in `firebase-tools` and the ESLint `minimatch` / `glob` tree. Clearing them means downgrading `firebase-tools` to 3.18.2 or ESLint to 4, which removes the current toolchain. The security overrides (`sharp` 0.35.5, `@grpc/grpc-js` 1.14.6, `gaxios` `uuid` 11.1.1, `jwks-rsa` `jose` 5.10.0) stay in place.
