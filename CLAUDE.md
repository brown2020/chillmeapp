# CLAUDE.md - Chill.me Project Guide

This file provides guidance for AI assistants working with the Chill.me codebase.

## Project Overview

Chill.me is a real-time video chat platform built with Next.js 16 and powered by LiveKit. Users can create rooms, invite guests via unique URLs, and engage in video chats. The platform includes a credit-based system for API access via Stripe.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 18.3, Tailwind CSS v4, Radix UI components
- **State**: Zustand 5.0
- **Video**: LiveKit (`livekit-client`, `@livekit/components-react`)
- **Auth**: Firebase Auth
- **Database**: Firebase Firestore
- **Payments**: Stripe
- **Icons**: Lucide React

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/webhook/livekit/ # LiveKit webhook endpoint
│   ├── auth/               # signin, signup, signout pages
│   ├── live/[roomId]/      # Dynamic meeting room routes
│   ├── past-meetings/      # Meeting history
│   ├── profile/            # User profile
│   └── layout.tsx          # Root layout with providers
├── frontend/
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components (Radix-based)
│   │   ├── Forms/          # AuthForm, CreateMeetingForm
│   │   └── ...             # Feature components
│   ├── hooks/              # useAuth, useMeeting, useToast
│   ├── zustand/            # useAuthStore, useMeetingStore
│   ├── services/           # auth.ts, broadcasting.ts, payment.ts
│   ├── providers/          # ThemeProvider, LiveKitProvider
│   ├── lib/firebase.ts     # Client-side Firebase config
│   └── styles/globals.css  # Tailwind + CSS variables
├── backend/
│   ├── services/           # Server-side services
│   └── lib/firebase.ts     # Firebase Admin SDK
├── types/                  # TypeScript definitions
└── utils/                  # Helper functions
```

## Key Path Aliases

```typescript
@/*          -> ./src/*
@chill-ui    -> ./src/frontend/components/ui
@frontend/*  -> ./src/frontend/*
@backend/*   -> ./src/backend/*
```

## Commands

```bash
npm run dev       # Start dev server (clears .next first)
npm run build     # Production build
npm start         # Start production server
npm run lint      # Run ESLint
npm run eslint:fix # Fix ESLint issues
npm run tslint    # TypeScript type checking (tsc)
```

## Code Patterns

### Server Actions
Server-side operations use the `"use server"` directive:
- `src/frontend/services/broadcasting.ts` - LiveKit room creation, token generation
- `src/frontend/services/payment.ts` - Stripe payment intents

### Client Components
Interactive components use `"use client"` directive. Meeting components must be wrapped in `LiveKitRoomWrapper` to access room context.

### State Management
- `useAuthStore` - User auth state (user object, isAuthenticating flag)
- `useMeetingStore` - Meeting state (mediaStatus, chatWidget visibility)

### Styling
- Tailwind CSS v4 with CSS variable-based theming
- Dark mode via `next-themes` (class-based)
- HSL color system for theme flexibility
- Use `cn()` utility from `@/utils/classUtils` for class merging

### Authentication Flow
1. Firebase Auth handles user credentials
2. `useAuth` hook provides login/signup/Google auth
3. `AuthGuard` component protects authenticated routes

### LiveKit Integration
- `LiveKitProvider` wraps the app (minimal, no room connection)
- `LiveKitRoomWrapper` wraps active meeting components
- `useMeeting` hook provides video controls (only works inside `LiveKitRoomWrapper`)
- `useMeetingStore` provides media status outside room context
- Room tokens are generated server-side via `getAccessToken()`

## Important Notes

### Environment Variables
Required env vars (see `.env.example`):
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` - LiveKit credentials
- `NEXT_PUBLIC_LIVEKIT_URL` - LiveKit WebSocket URL (client-side)
- `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` - Firebase Admin
- `NEXT_PUBLIC_FIREBASE_APIKEY` - Firebase client
- `NEXT_PUBLIC_STRIPE_KEY`, `STRIPE_SECRET_KEY` - Stripe (optional)

### ESLint Configuration
Uses ESLint v9 flat config format (`eslint.config.mjs`). Prettier is integrated.

### Firestore Models
Type definitions in `src/types/entities.d.ts` define Meeting and MeetingSnapShot structures.

## File Naming Conventions

- Components: PascalCase (`MeetingCard.tsx`)
- Hooks: camelCase with `use` prefix (`useMeeting.ts`)
- Services: camelCase (`broadcasting.ts`)
- Types: kebab-case with `.d.ts` extension (`entities.d.ts`)

## Testing

No test framework is currently configured. TypeScript type checking (`npm run tslint`) serves as the primary static analysis.

## License

GNU AGPL-3.0 - Network use requires source code disclosure.
