# Chill.me - Video Chat Platform

**Chill.me** is a real-time video chat platform powered by the **100ms Video SDK**. The application enables users to create rooms, invite guests via URLs, and enjoy a seamless video chat experience. The app is designed with a dark mode interface and allows for easy guest invitations, making it perfect for meetings, live streams, or casual hangouts.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Server Actions](#server-actions)
- [Usage](#usage)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Features

- **Real-Time Video Chat**: Leverages the 100ms SDK for high-quality, low-latency video communication.
- **Dynamic Room Creation**: Create and manage video chat rooms dynamically.
- **Guest Invitations**: Generate unique URLs to invite guests directly to your room.
- **Dark Mode Interface**: Designed with a dark mode UI for a sleek, modern look.
- **Responsive Design**: Optimized for various devices, including desktop and mobile.
- **Easy Deployment**: Built with Next.js 14 for easy deployment and server-side rendering.

## Demo

Check out the live demo [here](https://chill.me).

## Installation

### Prerequisites

- **Node.js**: Version 14.x or later
- **npm**: Version 6.x or later
- **100ms Account**: Sign up at [100ms](https://www.100ms.live/) to get your access key and secret.

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

Create a `.env` file in the root directory based on the provided `.env.example` file:

```sh
cp .env.example .env
```

Open the `.env` file and fill in your **100ms** credentials:

```plaintext
APP_SECRET=your_app_secret
APP_ACCESS_KEY=your_app_access_key
NEXT_PUBLIC_BASE_URL=https://chill.me
```

Replace `your_app_secret` and `your_app_access_key` with your actual credentials from the 100ms Dashboard.

### Run the Application

```sh
npm run dev
```

Visit `http://localhost:3000` in your browser to start using Chill.me locally.

## Getting Started

To create a new video room:

1. Enter your name in the "Your name" field.
2. Provide a room name if you are a broadcaster.
3. Click **Join** to enter the room.
4. Share the generated URL to invite guests directly to your room.

Guests can join a room by clicking on a shared link and entering their details in the join form.

## Server Actions

Chill.me utilizes **Next.js 14 server actions** to handle critical server-side operations such as room creation and authentication token generation. This approach provides better performance and security by managing these actions directly on the server.

### Server-Side Logic

The server-side logic is encapsulated within the following file:

**`app/serverActions/100msLiveActions.ts`**

This file contains the actions that interact with the 100ms server SDK to create rooms and generate authentication tokens.

#### Example Server Actions

- **Create a Room:**

  The `createRoom` function initializes the SDK and attempts to create a room using the provided room name. If successful, it returns the room ID; otherwise, it logs an error.

  ```typescript
  export async function createRoom(roomName: string) {
    console.log("Attempting to create a room with name:", roomName);
    try {
      const room = await hms.rooms.create({ name: roomName });
      console.log("Room created successfully:", room);
      return { roomId: room.id }; // Return the room ID
    } catch (error: unknown) {
      console.error("Error creating room:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the room",
      };
    }
  }
  ```

- **Generate an App Token:**

  The `getAppToken` function generates an authentication token for the client SDKs to join a room. It accepts the room ID, user ID, and role, and returns the generated token.

  ```typescript
  export async function getAppToken(
    roomId: string,
    userId: string,
    role: string
  ) {
    console.log("Attempting to get app token with parameters:", {
      roomId,
      userId,
      role,
    });
    try {
      const appToken = await hms.auth.getAuthToken({ roomId, role, userId });
      console.log("App token generated successfully:", appToken);
      return { appToken };
    } catch (error: unknown) {
      console.error("Error getting app token:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while getting the app token",
      };
    }
  }
  ```

These server actions ensure secure communication with the 100ms API, providing a robust backend for the application.

## Usage

### Components Overview

- **JoinForm.tsx**: The form to create or join a room.
- **Livestream.tsx**: The main component for managing the video chat and chat interface.
- **ChatView.tsx**: Displays the chat messages with real-time updates.
- **Footer.tsx**: Controls for toggling audio, video, and chat.
- **Header.tsx**: Displays user information and controls for leaving the room.

### Invite Guests

Guests can be invited by sharing the room URL, which is generated dynamically when a room is created. They can join by simply clicking the link and entering their name.

## Contributing

We welcome contributions to enhance Chill.me! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit (`git commit -m "Description of changes"`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## Support

For questions or support, please contact [info@ignitechannel.com](mailto:info@ignitechannel.com).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
