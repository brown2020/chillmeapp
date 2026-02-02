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

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | ^16.0.10 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | ^5.x |
| **UI Library** | [React](https://react.dev/) | ^19.2.4 |
| **Video** | [LiveKit](https://livekit.io/) | ^2.17.0 |
| **LiveKit React** | [@livekit/components-react](https://docs.livekit.io/reference/components/react/) | ^2.9.19 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | ^4.1.18 |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) | Various |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.0 |
| **Authentication** | [Firebase Auth](https://firebase.google.com/docs/auth) | ^12.6.0 |
| **Database** | [Firebase Firestore](https://firebase.google.com/docs/firestore) | ^12.6.0 |
| **Payments** | [Stripe](https://stripe.com/) | ^20.0.0 |
| **Icons** | [Lucide React](https://lucide.dev/) | ^0.563.0 |
| **Forms** | [React Hook Form](https://react-hook-form.com/) | ^7.53.1 |
| **Linting** | [ESLint](https://eslint.org/) (Flat Config) | ^9.39.2 |
| **Formatting** | [Prettier](https://prettier.io/) | ^3.7.4 |

## Installation

### Prerequisites

- **Node.js**: Version 18+ recommended
- **npm**: Version 9+ recommended
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
│   │   ├── signin/
│   │   ├── signup/
│   │   └── signout/
│   ├── live/[roomId]/             # Dynamic meeting room
│   ├── past-meetings/             # Meeting history
│   ├── profile/                   # User profile
│   ├── privacy/                   # Privacy policy
│   ├── terms/                     # Terms of service
│   ├── recording/                 # Recording page
│   ├── layout.tsx                 # Root layout with providers
│   └── page.tsx                   # Home page
├── frontend/
│   ├── components/                # React components
│   │   ├── ui/                    # Reusable UI (Radix-based)
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Chat/              # Chat components
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Popover.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── Forms/                 # Form components
│   │   │   ├── AuthForm.tsx
│   │   │   ├── CreateMeetingForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── AuthGuard.tsx          # Route protection
│   │   ├── ErrorBoundary.tsx      # Error handling
│   │   ├── Home.tsx               # Home component
│   │   ├── Livestream.tsx         # Video stream component
│   │   ├── MeetingCard.tsx        # Meeting display card
│   │   ├── MeetingChatWidget.tsx  # In-call chat
│   │   ├── MeetingControls.tsx    # Video/audio controls
│   │   └── MeetingMemberStream.tsx # Participant streams
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useMeeting.ts          # Meeting controls hook
│   │   └── useToast.ts            # Toast notifications
│   ├── zustand/                   # State stores
│   │   ├── useAuthStore.ts        # Auth state
│   │   └── useMeetingStore.ts     # Meeting state
│   ├── services/                  # API services
│   │   ├── auth.ts                # Auth operations
│   │   ├── broadcasting.ts        # LiveKit room management
│   │   ├── meeting.ts             # Meeting operations
│   │   ├── payment.ts             # Stripe payments
│   │   └── user.ts                # User operations
│   ├── providers/                 # React providers
│   │   ├── LiveKitProvider.tsx    # LiveKit context
│   │   └── ThemeProvider.tsx      # Theme context
│   ├── layout/                    # Layout components
│   │   ├── ContentWrapper.tsx
│   │   ├── Navbar.tsx
│   │   └── index.tsx
│   ├── lib/firebase.ts            # Client Firebase config
│   └── styles/globals.css         # Global styles
├── backend/
│   ├── services/                  # Server-side services
│   │   ├── auth.ts
│   │   ├── meeting.ts
│   │   └── storage.ts
│   └── lib/firebase.ts            # Firebase Admin SDK
├── types/                         # TypeScript definitions
│   ├── entities.d.ts
│   ├── firestore-models.d.ts
│   ├── menu.d.ts
│   └── user.d.ts
└── utils/                         # Utility functions
    ├── classUtils.ts              # cn() class merger
    ├── convertToSubcurrency.ts
    ├── dateUtils.ts
    └── roomCodeGenerator.ts
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
- `createRoom()` - Creates a new LiveKit room
- `getAccessToken()` - Generates participant access tokens

**`src/frontend/services/payment.ts`** - Stripe Operations:
- `createPaymentIntent()` - Initializes payment for credits
- `validatePaymentIntent()` - Confirms payment status

### LiveKit Integration

LiveKit powers all real-time video functionality:

```
┌─────────────────────────────────────────────────────┐
│                    App Layout                        │
│  ┌───────────────────────────────────────────────┐  │
│  │              LiveKitProvider                   │  │
│  │  (App-wide context, no room connection)       │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │         LiveKitRoomWrapper              │  │  │
│  │  │  (Active room connection)               │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │     Meeting Components            │  │  │  │
│  │  │  │  - MeetingMemberStream            │  │  │  │
│  │  │  │  - MeetingControls                │  │  │  │
│  │  │  │  - MeetingChatWidget              │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

Key hooks:
- `useMeeting()` - Video/audio controls (requires `LiveKitRoomWrapper`)
- `useMeetingStore` - Meeting state (works anywhere)

### State Management

Zustand stores manage application state:

**`useAuthStore`**
- `user` - Current Firebase user object
- `isAuthenticating` - Loading state

**`useMeetingStore`**
- `mediaStatus` - Camera/microphone states
- `chatWidgetVisible` - Chat panel visibility

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
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
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

## Security

- Never commit `.env` files or expose sensitive credentials
- Use environment variables for all secrets
- Consider using secret management services (AWS Secrets Manager, Google Secret Manager) for production

## Additional Resources

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit React Components](https://docs.livekit.io/reference/components/react/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)

---

<p align="center">
  Made with ❤️ by the Chill.me team
</p>
