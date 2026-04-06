# LiveKit Migration Notes

The application is now aligned around LiveKit for real-time video, audio, chat, and webhook handling.

## Current LiveKit touchpoints

- `src/frontend/services/broadcasting.ts`: room creation, access token generation, room deletion
- `src/frontend/providers/LiveKitProvider.tsx`: active room wrapper for LiveKit context
- `src/frontend/hooks/useMeeting.ts`: participant state, media controls, chat, disconnect handling
- `src/app/live/[roomId]/room-client.tsx`: token loading and room connection lifecycle
- `src/app/api/webhook/livekit/route.ts`: room completion and recording webhook processing

## Required environment variables

```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

## Environment Handling

The app now uses the standard Next.js environment variable flow through `.env`, `.env.local`, and deployed environment settings. Variables are read directly from `process.env` where they are needed.

## Recommended verification

- Run `npm run build`
- Create a room from the app
- Join a room from a second browser session
- Verify audio, video, chat, and leave/end controls
- Verify the LiveKit webhook updates completed meetings and recordings
