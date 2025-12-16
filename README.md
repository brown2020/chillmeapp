# Chill.me - Real-Time Video Chat Platform

**Chill.me** is a real-time video chat platform powered by **100ms Video SDK** for seamless communication. Users can create rooms, invite guests via unique URLs, and engage in high-quality video chats. The platform also supports a credit-based system for users who do not have their own API keys, allowing them to purchase credits and access the platform’s API services.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Server Actions](#server-actions)
  - [Payment Actions](#payment-actions)
  - [Live Stream Actions](#live-stream-actions)
- [Profile Management](#profile-management)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Features

- **Real-Time Video Chat**: High-quality, low-latency video communication powered by 100ms SDK.
- **Dynamic Room Creation**: Users can create video chat rooms and manage guests through unique URLs.
- **Guest Invitations**: Invite guests by sharing a room URL, allowing them to join directly.
- **API Key or Credit System**: Users can either use their own API keys (100ms, OpenAI, Stability) for free or purchase credits to use the platform’s API keys.
- **Dark Mode Interface**: Designed with a sleek, user-friendly dark mode.
- **Responsive Design**: Optimized for desktop and mobile devices.
- **Firebase Integration**: Real-time syncing of user profiles, API keys, and credits with Firebase.

## Demo

Check out the live demo of **Chill.me** [here](https://chill.me).

## Technologies Used

- **Next.js 16**: Framework for server-rendered React applications.
- **100ms Video SDK**: Powers the real-time video communication.
- **Stripe**: Handles credit purchases for users without their own API keys.
- **Firebase**: Manages user authentication, profiles, and credits.
- **Zustand**: Local state management, synced with Firebase.
- **Tailwind CSS v4**: Utility-first CSS framework for styling.
- **TypeScript**: Adds static types for more reliable code.
- **Lucide Icons**: Modern iconography for the user interface.
- **React 18**: Core UI library (pinned for `@100mslive/react-sdk` compatibility).
- **ESLint v9 (flat config)** + **Prettier**: Linting/formatting.

## Installation

### Prerequisites

- **Node.js**: Version 18+ recommended
- **npm**: Version 9+ recommended
- **100ms Account**: Sign up at [100ms](https://www.100ms.live/) for your API credentials.
- **Stripe Account**: Sign up at [Stripe](https://stripe.com/) for managing payments (optional if using your own API keys).

### Clone the Repository

```sh
git clone https://github.com/brown2020/chillmeapp.git
cd chillmeapp
```

### Install Dependencies

```sh
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory based on the provided `.env.example`:

```sh
cp .env.example .env
```

Open the `.env` file and fill in the required credentials for **100ms**, **Firebase**, and **Stripe** (if needed):

```plaintext
# 100ms (server-side SDK)
LIVE100MS_APP_SECRET=your_100ms_app_secret
LIVE100MS_APP_ACCESS_KEY=your_100ms_app_access_key

NEXT_PUBLIC_BASE_URL=https://chill.me

# Firebase Server Config
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Firebase Client Config
NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key

# Stripe Config (optional if using API keys)
NEXT_PUBLIC_STRIPE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Run the Application

```sh
npm run dev
```

Visit `http://localhost:3000` in your browser to use **Chill.me** locally.

## Environment Variables

Environment variables are used to manage API keys and Firebase configurations:

- **100ms Config**: `LIVE100MS_APP_SECRET`, `LIVE100MS_APP_ACCESS_KEY`
- **Firebase Config**: `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- **Stripe Config**: `NEXT_PUBLIC_STRIPE_KEY`, `STRIPE_SECRET_KEY` (required only for credit purchases)

Refer to the `.env.example` file for all required variables.

## Getting Started

To create a video room:

1. Enter your name in the "Your name" field.
2. Enter a room name if you're a broadcaster.
3. Click **Join** to create or enter a room.
4. Share the generated room URL to invite guests directly.

Guests can join by clicking the shared link and entering their details.

## Server Actions

Chill.me uses **Server Actions** to handle payments and live streaming features. Unlike traditional API routes, server actions allow you to run server-side code directly within your components without the need for creating separate API routes. This approach simplifies the codebase and improves performance by removing the need for client-server network requests in many cases.

### Benefits of Server Actions

- **Simplified Code**: Server actions are used within components, eliminating the need for a separate API route in many cases.
- **Performance**: By running the server code directly in the component, you avoid unnecessary round-trip requests between the client and server.
- **Security**: Server actions provide better security since sensitive logic remains on the server and never reaches the client.

### Payment Actions

Managed through **Stripe**, the server actions related to payments include:

- **createPaymentIntent**: Initializes a payment intent for credit purchases.
- **validatePaymentIntent**: Confirms the payment status by validating the payment intent.

### Live Stream Actions

Powered by **100ms**, the following actions manage room creation and authentication:

- **createRoom**: Creates a live stream room.
- **getAppToken**: Generates an authentication token for users to join the room.

Server action logic is contained within:

- `src/frontend/services/payment.ts`
- `src/frontend/services/broadcasting.ts`

## 100ms Notes / Troubleshooting

- **Roles must exist in your 100ms template**: joining will fail if you generate an auth token with a role name that doesn’t exist. The app now creates **room codes** on room creation and uses those discovered roles for token generation. See the 100ms React quickstart for the expected join/token flow: [100ms React Quickstart](https://www.100ms.live/docs/javascript/v2/quickstart/react-quickstart).
- **React version**: `@100mslive/react-sdk@0.11.0` peers `react < 19`, so this repo pins **React 18**.

## Scripts

```sh
npm run dev     # start dev server
npm run build   # production build
npm start       # start production server
npm run lint    # eslint (flat config)
npm run tslint  # typecheck (tsc)
```

## Profile Management

Users can manage their profiles, including API keys and credits, through the profile page:

- **Profile Store**: Stores user information such as API keys, display name, credits, and profile photo.
- **API Key Management**: Users can enter their own API keys (100ms, Fireworks, OpenAI, Stability) or use platform credits.
- **Credit System**: Users can purchase credits via Stripe if they don't have their own API keys.

The profile information is stored and synced with **Firebase**, ensuring real-time updates.

## Usage

### Components Overview

- **JoinForm.tsx**: Handles creating or joining rooms.
- **Livestream.tsx**: Manages the video chat and communication.
- **PaymentCheckoutPage.tsx**: Handles credit purchases through Stripe.
- **ProfileComponent.tsx**: Manages user API keys and credit preferences.
- **SuccessPage.tsx**: Redirect page after successful payments.
- **ChatView.tsx**: Displays real-time chat messages during video calls.
- **Header.tsx**: Controls for user settings and room navigation.
- **Footer.tsx**: Audio/video/chat controls for live stream rooms.

### Guest Invitations

Guests can be invited by sharing the room URL. They can join by clicking the link and entering their name.

## Deployment

To deploy **Chill.me**, follow these steps:

1. Build the project for production:

   ```sh
   npm run build
   ```

2. Start the production server:

   ```sh
   npm start
   ```

Alternatively, you can deploy the application to platforms like **Vercel** or **Netlify**, which support Node.js applications.

## Contributing

We welcome contributions to improve **Chill.me**! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit (`git commit -m "Description of changes"`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## Support

For any questions or support, contact [info@ignitechannel.com](mailto:info@ignitechannel.com).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security Recommendations

- Avoid exposing sensitive environment variables publicly.
- Use a secure environment management tool like `.env` files, or external services such as **AWS Secrets Manager** or **Google Secret Manager**.

## Additional Resources

- [100ms SDK Documentation](https://docs.100ms.live/)
- [Stripe API Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
