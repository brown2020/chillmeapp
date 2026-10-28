# Chill.me — Product specification

What the app does today. Engineering conventions are in [`AGENTS.md`](AGENTS.md). Setup is in [`README.md`](README.md). Next steps are in [`roadmap.md`](roadmap.md).

## Purpose

Chill.me is a low-friction video meeting app. A host signs in, starts a room, and shares a link. Guests can join without an account. Participants use audio, video, and chat. Hosts can record the session and review it later. Credits can be purchased on the profile page; meetings themselves are not gated on credits.

## Stack

Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 4, Zustand, LiveKit, Firebase Auth / Firestore / Storage, firebase-admin 14, Stripe, video.js 8. npm is the package manager. CI runs on Node 22.

There is no Next.js middleware file. `src/proxy.ts` checks the Firebase session cookie on protected routes and API routes.

## Routes

| Path | Who can open it |
|------|-----------------|
| `/` | Public |
| `/auth/signin`, `/auth/signup`, `/auth/signout`, `/auth/forgot-password`, `/auth/verify-email` | Public. Signed-in users are sent to `/live`, except `/auth/signout`. |
| `/terms`, `/privacy` | Public |
| `/live` | Signed-in hosts |
| `/live/[roomId]` | Public join link |
| `/past-meetings`, `/profile`, `/recording` | Signed-in users |
| `POST /api/auth/session` | Same-origin cookie create and delete |
| `POST /api/webhook/livekit` | LiveKit, signature required |
| `POST /api/webhook/stripe` | Stripe, signature required. Returns 503 when Stripe or the webhook secret is unset. |

Unauthenticated visits to protected pages redirect to sign-in. The callback path must stay on this site.

## Accounts

- Email and password, Google popup, password reset, and email-link sign-in.
- After Firebase Auth succeeds, the client exchanges an ID token for an httpOnly session cookie.
- Logout revokes refresh tokens and clears that cookie.
- Session create and delete reject a missing or foreign `Origin`.
- If the cookie cannot be saved, the client signs out instead of treating the user as logged in.

## Meetings

Creating a meeting:

1. The host is signed in.
2. Optional password is at least 8 characters. It is stored as a scrypt hash.
3. The server creates a LiveKit room (maximum 20 participants) and, when requested, starts room-composite egress.
4. The server creates `meeting_sessions/{roomId}`. The room id is four lowercase letter groups, such as `abc-def-ghi-jkl`.
5. If egress or the Firestore write fails, the LiveKit room is deleted and the host sees an error.

Joining:

- Guests and signed-in users can ask whether a password is required. That answer does not include the meeting document.
- Join attempts are rate limited per server instance before the password is checked.
- The host's LiveKit token is marked with a host role and `roomAdmin`. Guests get a `guest-` identity and are not room admins.
- A wrong password does not return a token.

In the call:

- Camera, microphone, chat, and copy-link controls.
- Chat is available on small screens as well as desktop.
- A guest leaves by disconnecting.
- The host ends the meeting by deleting the LiveKit room. Other clients leave when the room closes. A `meeting-ended` data message is honored only when the sender is the host.

When LiveKit reports `room_finished`, the webhook stores `session_duration`. Unknown rooms are acknowledged so LiveKit does not retry forever. A bad webhook signature returns 401.

## Recordings

- Egress must be enabled in the LiveKit project.
- The webhook accepts only https download URLs, rejects private and metadata addresses, does not follow redirects, and caps size and time.
- The file is stored at `recordings/{roomId}/{egressId}.mp4`.
- Playback is a server action. The caller must be the meeting host, and the requested path must match the path saved on that meeting. The signed URL lasts four hours and is not put in the query string.
- Past-meeting cards show the host's own display name, or "Unknown".

## History and credits

- `/past-meetings` lists the signed-in user's meetings that have a numeric `session_duration`, newest first. The query needs the composite index in `firestore.indexes.json`.
- Password fields are removed from the list returned to the browser.
- A failed history query shows an error instead of an empty list.
- Profile shows name, email, uid, and the credit balance.
- A credit purchase uses a server-chosen amount. Fulfillment checks payment status, amount, credit count, and the signed-in user, then applies credits once per PaymentIntent.
- The browser checkout path and the Stripe webhook share that fulfillment. Without `STRIPE_WEBHOOK_SECRET`, the webhook does not grant credits.

## Data

Firestore collections used by the app:

- `meeting_sessions/{roomId}` — host uid, created time, optional password hash, optional recording info, duration after the room ends.
- `users/{uid}` — credit balance.
- `users/{uid}/payment_events/{paymentIntentId}` — idempotent credit grants.

Firebase Storage holds recording objects. The repo does not contain Firestore or Storage rules. Client list queries still depend on those rules to limit who can read a meeting.

## Operational notes

- `firebase-admin` stays on the `jose` 5.10.0 override under `jwks-rsa`.
- Admin initialization logs a warning and substitutes empty objects when service-account credentials are missing, so `npm run build` can finish in CI before secrets are present.
- Client Firebase init is skipped when `NEXT_PUBLIC_FIREBASE_APIKEY` is empty, for the same reason.
- The license is AGPL-3.0.
