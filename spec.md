# Chill.me — Product Specification

Authoritative product overview, current application state, and roadmap for Chill.me.  
For agent/engineering conventions, see [`AGENTS.md`](AGENTS.md). For installation and env setup, see [`README.md`](README.md).

---

## 1. Product overview

### Product promise

Chill.me helps people start and join video meetings quickly, with reliable real-time audio/video, optional session recording, in-call chat, and a history of past sessions — without heavyweight meeting setup.

### Target users

| Segment | Need |
|---------|------|
| Individual hosts | Start a meeting in one click, share a link, control A/V |
| Team collaborators | Join calls with chat and stable LiveKit media |
| Returning users | Review past meeting duration and watch recordings when available |
| Platform operators (future) | Credits-based billing for extended usage and AI add-ons |

### Core workflows

1. **Sign up / sign in** — Email/password, Google, password reset, or email magic link
2. **Create meeting** — Preview camera, toggle record option, create LiveKit room, persist session in Firestore
3. **Join meeting** — Open shared `/live/[roomId]` URL; guests enter a display name, signed-in users auto-join
4. **In-call** — Mute/unmute, camera on/off, chat, copy link, leave (guest) or end (host)
5. **Review history** — Past meetings list shows completed sessions with duration; open recording when ready

### Product goals

- Minimize time from landing to in-call
- Keep host controls obvious (end meeting, share link, recording)
- Persist enough session metadata for history and playback
- Prepare for credits monetization without blocking core free meeting flows

---

## 2. Current application state

*Observations below are from codebase inspection (May 2026). Items marked **(inferred)** are conclusions not explicitly documented in code comments.*

### What the app currently does

Chill.me is a Next.js 16 single-repo web application. Authenticated users land on `/live`, create a LiveKit room, and are redirected to `/live/[roomId]`. The room client fetches a JWT via server actions, connects through `LiveKitRoomWrapper`, and renders a grid of participant video tiles with a control bar and optional chat sidebar. When LiveKit fires webhooks, the backend updates Firestore with session duration and recording file metadata. Users browse completed meetings at `/past-meetings` and play recordings at `/recording` via Video.js.

### Current feature inventory

| Feature | State | Notes |
|---------|-------|-------|
| Firebase Auth (email, Google) | **Shipped** | `useAuth`, auth forms |
| Password reset | **Shipped** | `/auth/forgot-password` |
| Email link sign-in | **Shipped** | `/auth/verify-email` |
| Home landing | **Shipped** | Marketing hero; CTAs to sign up or `/live` |
| Create meeting | **Shipped** | LiveKit room + Firestore `meeting_sessions` doc |
| Shareable room URL | **Shipped** | `/live/[roomId]`; copy from controls |
| Join meeting | **Shipped** | Authenticated users auto-join; signed-in hosts retain admin grants |
| Guest join without account | **Shipped** | `/live/[roomId]` public; guest name form; non-admin LiveKit token |
| A/V controls | **Shipped** | Pre-join preview + in-call toggles |
| Host end meeting | **Shipped** | Data message + disconnect; `roomAdmin` grant |
| In-call chat | **Shipped** | LiveKit chat; temporary (no persistence) |
| Session recording | **Shipped** | Egress starts on create when enabled; webhook uploads to Firebase Storage |
| Past meetings | **Shipped** | Lists sessions with `session_duration` only |
| Recording playback | **Shipped** | Past meetings link to `/recording` via Firebase download URL |
| Profile | **Minimal** | Display name, email, uid — no credits UI |
| Stripe credits | **Backend stub** | Server actions only; no checkout UI |
| Password-protected rooms | **Not implemented** | Listed in legacy planning doc only |
| Session lock | **Not implemented** | — |
| AI transcription / summaries | **Not implemented** | Legacy planning only |
| Dark mode | **Shipped** | `next-themes`, default dark |
| Terms / Privacy | **Shipped** | Static content pages |

### Current user flows

```
[Guest]  /live/{room} → enter name → In call → Leave → /
[Signed-in guest/host]  /live/{room} → auto-join → In call
[Host]   Create at /live → /live/{room} → End meeting → /
[User]   /past-meetings → MeetingCard → /recording?source=… (if recording ready)
```

**Auth redirect rules:** logged-in users hitting `/auth/*` go to `/live`; unauthenticated users hitting protected routes go to `/auth/signin`.

### Existing integrations

| Service | Usage |
|---------|--------|
| **LiveKit Cloud** | Room CRUD, JWT access tokens, WebRTC media, chat data channel, webhooks |
| **Firebase Auth** | Identity |
| **Firestore** | `meeting_sessions` collection; `users` collection (read server-side; credits fields in types) |
| **Firebase Storage** | Recording download URLs via client SDK |
| **Stripe** | PaymentIntent create/validate server actions (unused by UI) |

### Current architecture summary

- **Frontend:** React client components, Zustand, Tailwind/Radix, LiveKit React components
- **Backend:** Next.js Server Actions + one API route (`/api/webhook/livekit`)
- **Persistence split:** Client writes new meetings; server/webhook updates session completion and recording fields
- **No middleware, no cron, no job queue** — all async work is webhook-driven or client-initiated
- **Room IDs:** Random segmented codes (`abc-def-ghi-jkl`) via `roomCodeGenerator.ts`
- **Participant cap:** 20 (`createRoom` in `broadcasting.ts`) **(inferred from code)**

### Existing technical constraints

- Client-side route guard only — not a substitute for Firestore security rules
- LiveKit and Firebase Admin env vars required for production build/runtime
- `MeetingSession` type in `firestore-models.d.ts` still reflects legacy 100ms schema — runtime documents are simpler
- `listUserMeetings` filters to documents with `session_duration`, so in-progress meetings never appear in history
- Past meetings query requires Firestore composite index on `broadcaster` + `created_at` **(inferred — standard Firestore requirement)**
- AGPL-3.0 applies to network deployments

### Known limitations

1. **Recording pipeline** — ~~incomplete~~ **Resolved in Milestone 2**; requires LiveKit egress enabled on the project
2. **No guest access** — ~~product copy and original MVP spec implied link-only guest join; code requires authentication~~ **Resolved in Milestone 1**
3. **Credits / Stripe** — no user-facing purchase or balance display despite `UserSnapshot.credits` type and payment server actions
4. **Profile** — no photo upload, display name edit, or account management beyond auth provider
5. **Mobile UX** — meeting grid and chat layout work on desktop-first breakpoints; chat hidden on small screens when sidebar layout applies
6. **No automated tests** — regressions caught manually or via CI lint/build only
7. **Navbar styling** — fixed light navbar (`bg-white`) may clash with dark theme **(inferred UX issue)**
8. **Webhook recording path** — stores LiveKit egress filename; playback uses Firebase Storage `getDownloadURL` — paths must match bucket layout or playback fails **(inferred integration risk)**

---

## 3. Product roadmap

Ordered by product impact and dependency. Each item is sized for one clean commit sequence on `dev`.

### Milestone 1 — Guest join via meeting link ✅

**Status:** Complete (dev, May 2026)

**User value:** Hosts share a link; guests enter a display name and join without creating an account — matching core product promise.

**Acceptance criteria:**

- [x] `/live/[roomId]` accessible without Firebase auth (or via lightweight guest identity)
- [x] Guest receives LiveKit token with non-admin grants
- [x] Host retention of `roomAdmin` unchanged
- [x] Auth-required pages (`/past-meetings`, `/profile`) remain protected

**Implementation note:** Added `isGuestJoinRoute()` for proxy/AuthGuard; guest tokens use `guest-{uuid}` identities via `getAccessToken()` when no session cookie; `GuestJoinForm` collects display name on `/live/[roomId]`.

**Follow-up (not in scope):** Persist guest display names across reconnects within the same browser session.

---

### Milestone 2 — Complete session recording end-to-end ✅

**Status:** Complete (dev, May 2026)

**User value:** Hosts who enable “Record Session” receive a playable recording in past meetings.

**Acceptance criteria:**

- [x] Creating a room with record enabled starts LiveKit egress (or equivalent)
- [x] Firestore meeting doc stores `recording_info.enabled: true` at creation
- [x] `egress_ended` webhook path produces a Storage path that `fetchRecording` can resolve
- [x] `MeetingCard` shows “Watch Recording” for completed egress; `/recording` plays file

**Implementation note:** `createRoom()` starts `RoomComposite` egress when recording is enabled; `CreateMeetingForm` persists `recording_info.enabled` on create; `egress_ended` webhook downloads the LiveKit file URL and uploads to Firebase Storage via `uploadRecordingToStorage`, then stores the bucket-relative path on the meeting doc.

**Follow-up (not in scope):** Surface recording-start failures in UI copy beyond the create-room error; add retry when egress completes without a download URL.

---

### Milestone 3 — Password-protected meetings

**User value:** Hosts restrict access to invited people who know the room password.

**Acceptance criteria:**

- Optional password field on create-meeting form
- Join flow prompts for password before token issue when room is protected
- Incorrect password shows clear error; correct password proceeds to LiveKit join
- Password stored hashed server-side (Firestore or room metadata via server only)

**Implementation intent:** Server-side validation before `getAccessToken`; never embed secrets in client bundle.

---

### Milestone 4 — Profile credits and Stripe checkout

**User value:** Users see credit balance and can purchase credits for premium usage.

**Acceptance criteria:**

- Profile shows credits from Firestore `users` document
- Purchase flow uses existing `createPaymentIntent` / `validatePaymentIntent`
- Successful payment increments credits server-side
- Graceful empty state when Stripe env vars missing

**Implementation intent:** Profile UI + Stripe Elements; server action to credit user after validated payment; reuse `@stripe/react-stripe-js` dependency.

---

### Milestone 5 — Host session lock

**User value:** Host prevents new participants after everyone expected has joined.

**Acceptance criteria:**

- Host can lock/unlock session from meeting controls menu
- Locked room rejects new token requests or LiveKit joins with user-visible message
- Existing participants unaffected

**Implementation intent:** Persist lock flag on meeting doc; check in `getAccessToken`; optional LiveKit room metadata sync.

---

### Milestone 6 — Mobile-first in-call experience

**User value:** Reliable meetings on phones — controls reachable, chat accessible, readable participant grid.

**Acceptance criteria:**

- Chat reachable on viewports &lt; `lg` (drawer or bottom sheet)
- Control bar usable with touch targets ≥ 44px
- Participant grid readable at 1–4 participants on narrow screens
- No horizontal overflow on `/live/[roomId]`

**Implementation intent:** Responsive updates to `Livestream.tsx`, `MeetingControls.tsx`, `MeetingChatWidget.tsx`; test common breakpoints.

---

### Milestone 7 — Landing page activation and pricing clarity

**User value:** New visitors understand what Chill.me does and how credits pricing works before sign-up.

**Acceptance criteria:**

- Home (`/`) communicates: free meetings, recording, chat, credits model at high level
- Clear primary CTA (Get Started) and secondary (Sign In)
- Pricing section reflects env-configured credits product (or “coming soon” if Stripe disabled)
- Terms/Privacy linked from footer **(inferred — footer menu constants exist but are not wired in layout)**

**Implementation intent:** Enhance `Home.tsx` and layout footer using `MENU_ITEMS` from `menuItems.ts`.

---

### Milestone 8 — Usage-based credit deduction

**User value:** Sustainable monetization — credits consumed by meeting usage (and later AI features).

**Acceptance criteria:**

- Meeting duration or LiveKit usage decrements credits server-side after session ends
- Insufficient credits block new room creation with actionable message
- Usage history visible on profile (last N deductions)

**Implementation intent:** Webhook `room_finished` handler deducts credits via Admin Firestore; configurable rates in env; depends on Milestone 4.

---

### Milestone 9 — AI meeting transcription (post-call)

**User value:** Searchable transcript after recorded meetings.

**Acceptance criteria:**

- Recorded meetings optionally processed for transcript within reasonable delay
- Past meetings show transcript link or excerpt
- Credit cost surfaced before enabling transcription

**Implementation intent:** Post-egress processing job (webhook-triggered server action); store transcript in Firestore/Storage; depends on Milestones 2, 4, and 8. **(inferred — aligns with legacy planning doc, not yet present in code)**

---

## Appendix: LiveKit migration status

Migration from 100ms to LiveKit is **complete** for real-time media. Remaining legacy artifacts:

- `MeetingSession` type fields (`app_id`, `template_id`, `room_codes`, etc.)
- Unused `uploadRecordingToStorage` from earlier recording approach — **now used by egress webhook**

Operational verification checklist (manual):

1. `npm run build`
2. Create room from `/live`
3. Join from second browser session
4. Verify A/V, chat, leave/end
5. Confirm webhook updates `session_duration` on room finish

See [`AGENTS.md`](AGENTS.md) for file-level touchpoints.
