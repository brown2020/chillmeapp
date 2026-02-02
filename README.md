# Chill.me - Real-Time Video Chat Platform

<p align="center">
  <img src="src/frontend/assets/banner.png" alt="Chill.me Banner" width="600" />
</p>

**Chill.me** is a modern real-time video chat platform powered by **LiveKit** for seamless, high-quality communication. Users can create rooms, invite guests via unique URLs, and engage in video chats with built-in chat functionality. The platform features a credit-based system for users who want to access premium API services.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Server Actions](#server-actions)
  - [LiveKit Integration](#livekit-integration)
  - [State Management](#state-management)
- [Scripts](#scripts)
- [Profile Management](#profile-management)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Additional Resources](#additional-resources)

## Features

- **Real-Time Video Chat**: High-quality, low-latency video communication powered by LiveKit
- **Dynamic Room Creation**: Create video chat rooms with unique URLs for easy sharing
- **Guest Invitations**: Invite guests by sharing a room link—no account required to join
- **In-Call Chat**: Real-time text chat during video calls
- **Meeting History**: View past meetings and recordings
- **Credit System**: Purchase credits via Stripe for premium features
- **Dark Mode**: Sleek, modern dark mode interface with theme persistence
- **Responsive Design**: Optimized for desktop and mobile devices
- **Firebase Integration**: Real-time syncing of user profiles, meetings, and data
- **Google Authentication**: One-click sign-in with Google

## Demo

Check out the live demo of **Chill.me** at [chill.me](https://chill.me)

## Tech Stack

### Core Dependencies

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | ^16.0.10 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | ^5 |
| **UI Library** | [React](https://react.dev/) | ^19.2.4 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | ^4.1.18 |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.0-rc.2 |

### Video & Real-Time

| Technology | Version | Description |
|------------|---------|-------------|
| [livekit-client](https://livekit.io/) | ^2.17.0 | Client-side WebRTC SDK |
| [@livekit/components-react](https://docs.livekit.io/reference/components/react/) | ^2.9.19 | React components for LiveKit |
| [@livekit/components-styles](https://docs.livekit.io/reference/components/react/) | ^1.2.0 | Default LiveKit styles |
| [livekit-server-sdk](https://docs.livekit.io/server-sdk/) | ^2.15.0 | Server-side room management |

### Firebase

| Technology | Version | Description |
|------------|---------|-------------|
| [firebase](https://firebase.google.com/docs) | ^12.6.0 | Client SDK (Auth, Firestore) |
| [firebase-admin](https://firebase.google.com/docs/admin/setup) | ^13.6.0 | Admin SDK for server operations |

### UI Components

| Technology | Version |
|------------|---------|
| [@radix-ui/react-avatar](https://www.radix-ui.com/) | ^1.1.1 |
| [@radix-ui/react-dropdown-menu](https://www.radix-ui.com/) | ^2.1.2 |
| [@radix-ui/react-popover](https://www.radix-ui.com/) | ^1.1.2 |
| [@radix-ui/react-slot](https://www.radix-ui.com/) | ^1.1.0 |
| [@radix-ui/react-switch](https://www.radix-ui.com/) | ^1.1.1 |
| [@radix-ui/react-toast](https://www.radix-ui.com/) | ^1.2.2 |
| [@radix-ui/react-tooltip](https://www.radix-ui.com/) | ^1.1.3 |
| [lucide-react](https://lucide.dev/) | ^0.563.0 |

### Payments & Utilities

| Technology | Version | Description |
|------------|---------|-------------|
| [stripe](https://stripe.com/) | ^20.0.0 | Payment processing (server) |
| [@stripe/react-stripe-js](https://stripe.com/docs/stripe-js/react) | ^5.4.1 | Stripe React components |
| [react-hook-form](https://react-hook-form.com/) | ^7.53.1 | Form state management |
| [axios](https://axios-http.com/) | ^1.13.4 | HTTP client |
| [uuid](https://github.com/uuidjs/uuid) | ^13.0.0 | Unique ID generation |
| [sharp](https://sharp.pixelplumbing.com/) | ^0.34.5 | Image optimization |
| [video.js](https://videojs.com/) | ^8.18.1 | Video player |
| [next-themes](https://github.com/pacocoursey/next-themes) | ^0.4.6 | Theme management |

### Styling Utilities

| Technology | Version |
|------------|---------|
| [class-variance-authority](https://cva.style/) | ^0.7.0 |
| [clsx](https://github.com/lukeed/clsx) | ^2.1.1 |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | ^3.4.0 |
| [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) | ^1.0.7 |

### Development Tools

| Technology | Version |
|------------|---------|
| [ESLint](https://eslint.org/) (Flat Config) | ^9.39.2 |
| [Prettier](https://prettier.io/) | ^3.7.4 |
| [Husky](https://typicode.github.io/husky/) | ^9.1.6 |
| [lint-staged](https://github.com/lint-staged/lint-staged) | ^16.2.7 |
| [@types/node](https://www.npmjs.com/package/@types/node) | ^25.0.2 |
| [@types/react](https://www.npmjs.com/package/@types/react) | ^19.2.10 |

## Installation

### Prerequisites

- **Node.js**: Version 20+ recommended (minimum 18.x)
- **npm**: Version 10+ recommended (minimum 9.x)
- **LiveKit Account**: Sign up at [LiveKit Cloud](https://cloud.livekit.io/) for your API credentials
- **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/)
- **Stripe Account** (optional): Sign up at [Stripe](https://stripe.com/) for payment processing

### Clone the Repository

```bash
git clone https://github.com/brown2020/chillmeapp.git
cd chillmeapp
```

### Install Dependencies

This repo uses `package-lock.json` (lockfileVersion 3). For reproducible installs:

```bash
npm ci
```

Or for a fresh install:

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your credentials (see [Environment Variables](#environment-variables) section).

### Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Environment Variables

Create a `.env` file with the following variables:

### LiveKit Configuration

```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

### Firebase Server Configuration

```env
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERTS_URL=your_client_certs_url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

### Firebase Client Configuration

```env
NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=your_firebase_measurement_id
```

### Stripe Configuration (Optional)

```env
NEXT_PUBLIC_STRIPE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PRODUCT_NAME=chillme_demo_credits
NEXT_PUBLIC_CREDITS_PER_IMAGE=5
```

### Other

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_COOKIE_NAME=chillmeAuthToken
```

## Getting Started

### Creating a Video Room

1. Sign in with your Google account or create an account
2. Enter your name and a room name on the home page
3. Click **Create Meeting** to generate a new room
4. Share the room URL with participants

### Joining a Room

1. Click on a shared room link
2. Enter your display name
3. Allow camera/microphone permissions
4. Click **Join** to enter the meeting

### During a Meeting

- Toggle camera and microphone using the control bar
- Open the chat panel to send messages
- Leave the meeting using the end call button

## Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── api/webhook/livekit/       # LiveKit webhook endpoint
│   ├── auth/                      # Authentication pages
│   │   ├── signin/                # Email/password & Google login
│   │   ├── signup/                # User registration
│   │   ├── signout/               # Logout handling
│   │   ├── forgot-password/       # Password reset request
│   │   └── verify-email/          # Email verification
│   ├── live/                      # Meeting pages
│   │   ├── page.tsx               # Meeting list/create
│   │   └── [roomId]/              # Dynamic meeting room
│   │       ├── page.tsx           # Server component
│   │       └── room-client.tsx    # Client component with LiveKit
│   ├── past-meetings/             # Meeting history
│   ├── profile/                   # User profile
│   ├── privacy/                   # Privacy policy
│   ├── terms/                     # Terms of service
│   ├── recording/                 # Recording page
│   ├── layout.tsx                 # Root layout with providers
│   └── page.tsx                   # Home page
├── frontend/
│   ├── assets/                    # Static assets
│   │   ├── banner.png             # App banner
│   │   ├── logo.png               # App logo
│   │   └── google_ctn.svg         # Google sign-in button
│   ├── components/                # React components
│   │   ├── ui/                    # Reusable UI (Radix-based)
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Chat/              # Chat components
│   │   │   │   ├── ChatBubble.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ChatMessageList.tsx
│   │   │   │   ├── MessageLoading.tsx
│   │   │   │   └── index.ts
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Icons/             # Custom icons
│   │   │   │   └── Google.jsx
│   │   │   ├── Input.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   ├── Popover.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Toaster.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts           # Barrel exports
│   │   ├── Forms/                 # Form components
│   │   │   ├── AuthForm.tsx       # Sign-in form
│   │   │   ├── CreateMeetingForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── AuthGuard.tsx          # Route protection
│   │   ├── ErrorBoundary.tsx      # Error handling
│   │   ├── Home.tsx               # Home component
│   │   ├── Livestream.tsx         # Video stream component
│   │   ├── MeetingCard.tsx        # Meeting display card
│   │   ├── MeetingChatWidget.tsx  # In-call chat
│   │   ├── MeetingControls.tsx    # Video/audio controls
│   │   ├── MeetingMemberStream.tsx # Participant streams
│   │   ├── Modal.tsx              # Modal dialog
│   │   ├── PastMeetings.tsx       # Meeting history list
│   │   ├── PrivacyPage.tsx        # Privacy policy content
│   │   ├── ProfileComponent.tsx   # User profile UI
│   │   ├── TermsPage.tsx          # Terms of service content
│   │   └── VideoPlayer.tsx        # Video playback component
│   ├── constants/                 # App constants
│   │   └── menuItems.ts           # Navigation menu config
│   ├── hooks/                     # Custom hooks
│   │   ├── index.ts               # Barrel exports
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useMeeting.ts          # Meeting controls hook
│   │   └── useToast.ts            # Toast notifications
│   ├── zustand/                   # State stores
│   │   ├── useAuthStore.ts        # Auth state
│   │   └── useMeetingStore.ts     # Meeting state
│   ├── services/                  # API services (Server Actions)
│   │   ├── auth.ts                # Auth operations
│   │   ├── broadcasting.ts        # LiveKit room management
│   │   ├── meeting.ts             # Meeting operations
│   │   ├── payment.ts             # Stripe payments
│   │   └── user.ts                # User operations
│   ├── providers/                 # React providers
│   │   ├── LiveKitProvider.tsx    # LiveKit room wrapper
│   │   └── ThemeProvider.tsx      # Theme context (next-themes)
│   ├── layout/                    # Layout components
│   │   ├── ContentWrapper.tsx
│   │   ├── Navbar.tsx
│   │   └── index.tsx
│   ├── lib/firebase.ts            # Client Firebase config
│   └── styles/globals.css         # Global styles + Tailwind
├── backend/
│   ├── services/                  # Server-side services
│   │   ├── auth.ts                # Auth token verification
│   │   ├── meeting.ts             # Meeting CRUD operations
│   │   └── storage.ts             # File storage operations
│   └── lib/firebase.ts            # Firebase Admin SDK config
├── types/                         # TypeScript definitions
│   ├── entities.d.ts              # Meeting, User entities
│   ├── firestore-models.d.ts      # Firestore document types
│   ├── menu.d.ts                  # Menu item types
│   └── user.d.ts                  # User profile types
└── utils/                         # Utility functions
    ├── classUtils.ts              # cn() class merger (clsx + tailwind-merge)
    ├── convertToSubcurrency.ts    # Stripe amount conversion
    ├── dateUtils.ts               # Date formatting helpers
    └── roomCodeGenerator.ts       # Unique room ID generation
```

### Path Aliases

```typescript
@/*          → ./src/*
@chill-ui    → ./src/frontend/components/ui
@frontend/*  → ./src/frontend/*
@backend/*   → ./src/backend/*
```

## Architecture

### Server Actions

Chill.me uses Next.js Server Actions for secure server-side operations:

**`src/frontend/services/broadcasting.ts`** - LiveKit Operations:
- `createRoom(shouldRecord)` - Creates a new LiveKit room with optional recording
- `getAccessToken(roomName, participantIdentity, isHost)` - Generates JWT access tokens with appropriate permissions
- `deleteRoom(roomName)` - Removes a LiveKit room

**`src/frontend/services/payment.ts`** - Stripe Operations:
- `createPaymentIntent(amount)` - Initializes payment for credits
- `validatePaymentIntent(paymentIntentId)` - Confirms payment status

### LiveKit Integration

LiveKit powers all real-time video functionality. The architecture uses on-demand room connections:

```
┌─────────────────────────────────────────────────────────┐
│                      App Layout                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │            ThemeProvider + AuthGuard             │   │
│   │  ┌───────────────────────────────────────────┐  │   │
│   │  │              Regular Pages                 │  │   │
│   │  │   (Home, Profile, Past Meetings, etc.)    │  │   │
│   │  └───────────────────────────────────────────┘  │   │
│   │                                                  │   │
│   │  ┌───────────────────────────────────────────┐  │   │
│   │  │       /live/[roomId] - RoomClient         │  │   │
│   │  │  ┌─────────────────────────────────────┐  │  │   │
│   │  │  │       LiveKitRoomWrapper            │  │  │   │
│   │  │  │  (Active WebRTC connection)         │  │  │   │
│   │  │  │  ┌───────────────────────────────┐  │  │  │   │
│   │  │  │  │     Meeting Components        │  │  │  │   │
│   │  │  │  │  - Livestream                 │  │  │  │   │
│   │  │  │  │  - MeetingMemberStream        │  │  │  │   │
│   │  │  │  │  - MeetingControls            │  │  │  │   │
│   │  │  │  │  - MeetingChatWidget          │  │  │  │   │
│   │  │  │  └───────────────────────────────┘  │  │  │   │
│   │  │  └─────────────────────────────────────┘  │  │   │
│   │  └───────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Connection Flow:**
1. User navigates to `/live/[roomId]`
2. `RoomClient` fetches a JWT token via `getJoinToken()`
3. `LiveKitRoomWrapper` establishes WebRTC connection with the token
4. `useMeeting()` hook provides room controls within the wrapper

**Key Components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| `LiveKitRoomWrapper` | `providers/LiveKitProvider.tsx` | Wraps active meeting with LiveKit room context |
| `RoomClient` | `app/live/[roomId]/room-client.tsx` | Handles token fetching and connection lifecycle |
| `Livestream` | `components/Livestream.tsx` | Main meeting UI container |
| `useMeeting` | `hooks/useMeeting.ts` | Video/audio controls, chat, participants |

**Key Hooks:**
- `useMeeting()` - Full meeting controls (requires `LiveKitRoomWrapper` context)
- `getJoinToken()` - Helper to fetch access token before joining
- `useMeetingStore` - Zustand store for media state (works anywhere)

### State Management

Zustand stores manage application state with a minimal, focused design:

**`useAuthStore`** (`src/frontend/zustand/useAuthStore.ts`)
```typescript
interface AuthState {
  user: User | null;           // Firebase User object
  isAuthenticating: boolean;   // Loading state during auth check
}
```
Actions: `setAuthDetails()`, `clearAuthDetails()`, `setIsAuthenticating()`

**`useMeetingStore`** (`src/frontend/zustand/useMeetingStore.ts`)
```typescript
interface MeetingStore {
  mediaStatus: { audio: boolean; video: boolean };  // Track enabled states
  showChatWidget: boolean;                          // Chat panel visibility
}
```
Actions: `setMediaStatus()`, `setShowChatWidget()`

## Scripts

```bash
# Development
npm run dev          # Start dev server (clears .next cache)

# Production
npm run build        # Create production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run eslint:fix   # Auto-fix ESLint issues
npm run tslint       # TypeScript type checking

# Utilities
npm run tunnel       # Create SSH tunnel for testing
npm run prepare      # Setup Husky git hooks
```

## Profile Management

Users can manage their profiles through the profile page:

- **Display Name**: Customize your name shown in meetings
- **Profile Photo**: Upload a profile picture
- **Credit Balance**: View and purchase credits
- **Meeting History**: Access past meetings

Profile data syncs in real-time with Firebase Firestore.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/)
3. Configure environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

> **Note**: For the standalone output, add `output: 'standalone'` to your `next.config.mjs`. Alternatively, use the simpler version:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`npm run lint`)
5. Commit your changes (`git commit -m "Add amazing feature"`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- ESLint v9 with flat config (`eslint.config.mjs`)
- Prettier for formatting
- Husky pre-commit hooks for quality enforcement

## Support

For questions or support:
- Open an [issue](https://github.com/brown2020/chillmeapp/issues)
- Email: [info@ignitechannel.com](mailto:info@ignitechannel.com)

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See [`LICENSE.md`](LICENSE.md) for full details.

> **Note**: If you run a modified version of this app on a network, AGPL requires you to provide the corresponding source code to users interacting with it. See section 13 in `LICENSE.md`.

## API Endpoints

### LiveKit Webhook

**`POST /api/webhook/livekit`**

Receives webhook events from LiveKit for room and recording lifecycle management.

**Handled Events:**
| Event | Action |
|-------|--------|
| `room_finished` | Updates meeting with session duration |
| `egress_ended` | Updates meeting with recording file path |
| `participant_joined` | Logs participant activity |
| `participant_left` | Logs participant activity |

**Setup:**
1. Configure webhook URL in LiveKit Cloud dashboard: `https://your-domain.com/api/webhook/livekit`
2. Ensure `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are set for signature verification

## Security

- Never commit `.env` files or expose sensitive credentials
- Use environment variables for all secrets
- Webhook endpoints verify signatures using LiveKit's `WebhookReceiver`
- Firebase Security Rules should be configured for Firestore and Storage
- Consider using secret management services (AWS Secrets Manager, Google Secret Manager) for production

## Additional Resources

### Core Technologies
- [Next.js Documentation](https://nextjs.org/docs) - App Router, Server Actions, API Routes
- [React 19 Documentation](https://react.dev/) - Hooks, Server Components
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

### Video & Real-Time
- [LiveKit Documentation](https://docs.livekit.io/) - Core concepts, server SDK
- [LiveKit React Components](https://docs.livekit.io/reference/components/react/) - React hooks and components
- [LiveKit Cloud Dashboard](https://cloud.livekit.io/) - Project management

### Backend Services
- [Firebase Documentation](https://firebase.google.com/docs) - Auth, Firestore, Storage
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) - Server-side operations
- [Stripe Documentation](https://stripe.com/docs) - Payment integration

### UI & Styling
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs) - Utility-first CSS
- [Radix UI Primitives](https://www.radix-ui.com/docs/primitives/overview/introduction) - Accessible components
- [Lucide Icons](https://lucide.dev/icons/) - Icon library

### State Management
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction) - Minimal state management

---

<p align="center">
  Made with ❤️ by the Chill.me team
</p>
