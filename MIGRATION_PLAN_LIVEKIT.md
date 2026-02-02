# Migration Plan: 100ms to LiveKit

This document outlines the complete migration from 100ms SDK to LiveKit for the Chill.me video chat application.

## Executive Summary

| Aspect | 100ms (Current) | LiveKit (Target) |
|--------|-----------------|------------------|
| Free Tier | 10k mins/mo | 50k mins/mo |
| React Support | React 18 only | React 18 & 19 |
| Open Source | No | Yes (Apache 2.0) |
| Self-Hostable | No | Yes |
| Community | Small | Large & Active |

**Estimated Migration Effort:** 2-3 days for experienced developer

---

## Phase 1: Setup & Dependencies

### 1.1 Remove 100ms packages

```bash
npm uninstall @100mslive/react-sdk @100mslive/hms-video-store @100mslive/server-sdk
```

### 1.2 Install LiveKit packages

```bash
npm install livekit-client @livekit/components-react @livekit/components-styles livekit-server-sdk
```

### 1.3 Update environment variables

**Remove:**
```env
LIVE100MS_APP_ACCESS_KEY=xxx
LIVE100MS_APP_SECRET=xxx
```

**Add:**
```env
LIVEKIT_API_KEY=xxx
LIVEKIT_API_SECRET=xxx
LIVEKIT_URL=wss://your-project.livekit.cloud
```

---

## Phase 2: Server-Side Migration

### 2.1 Replace `src/frontend/services/broadcasting.ts`

**Current (100ms):**
```typescript
import * as HMS from "@100mslive/server-sdk";

const hms = new HMS.SDK(app_access_key, app_secret);

export async function createRoom(shouldRecord: boolean) {
  const room = await hms.rooms.create({ ... });
  const roomCodes = await hms.roomCodes.create(room.id);
  return { room, roomCodes };
}

export async function getAppToken(roomId, userId, role) {
  const appToken = await hms.auth.getAuthToken({ roomId, role, userId });
  return { appToken };
}
```

**New (LiveKit):**
```typescript
"use server";

import { RoomServiceClient, AccessToken, VideoGrant } from "livekit-server-sdk";
import { generateUniqueRoomCode } from "@/utils/codeUtils";

const livekitHost = process.env.LIVEKIT_URL!;
const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

export async function createRoom(shouldRecord: boolean) {
  const roomName = generateUniqueRoomCode();

  const room = await roomService.createRoom({
    name: roomName,
    emptyTimeout: 10 * 60, // 10 minutes
    maxParticipants: 20,
    metadata: JSON.stringify({ recording: shouldRecord }),
  });

  return {
    room: {
      id: room.name,
      name: room.name,
      created_at: new Date().toISOString(),
    },
    error: null,
  };
}

export async function getAccessToken(
  roomName: string,
  participantIdentity: string,
  isHost: boolean
) {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    ttl: "2h",
  });

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true, // For chat
    roomAdmin: isHost, // Host can kick/mute others
  };

  at.addGrant(grant);
  const token = await at.toJwt();

  return { token };
}

export async function deleteRoom(roomName: string) {
  await roomService.deleteRoom(roomName);
}
```

---

## Phase 3: Provider Migration

### 3.1 Replace `src/frontend/providers/HMSProvider.tsx`

**Current (100ms):**
```typescript
import { HMSRoomProvider } from "@100mslive/react-sdk";

export function HMSProvider({ children }) {
  return <HMSRoomProvider>{children}</HMSRoomProvider>;
}
```

**New (LiveKit):**
```typescript
"use client";

import * as React from "react";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";

// Context for sharing room state
interface LiveKitContextType {
  token: string | null;
  serverUrl: string;
  setToken: (token: string | null) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

const LiveKitContext = React.createContext<LiveKitContextType | null>(null);

export function useLiveKitContext() {
  const context = React.useContext(LiveKitContext);
  if (!context) {
    throw new Error("useLiveKitContext must be used within LiveKitProvider");
  }
  return context;
}

export function LiveKitProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  return (
    <LiveKitContext.Provider
      value={{ token, serverUrl, setToken, isConnected, setIsConnected }}
    >
      {children}
    </LiveKitContext.Provider>
  );
}

// Wrapper component for active room sessions
export function LiveKitRoomWrapper({
  children,
  token,
  onConnected,
  onDisconnected,
}: {
  children: React.ReactNode;
  token: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}) {
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      video={true}
      audio={true}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
    >
      {children}
    </LiveKitRoom>
  );
}
```

### 3.2 Update `src/app/layout.tsx`

**Change:**
```typescript
import { HMSProvider } from "@frontend/providers/HMSProvider";
// to
import { LiveKitProvider } from "@frontend/providers/LiveKitProvider";
```

And replace `<HMSProvider>` with `<LiveKitProvider>`.

---

## Phase 4: Hook Migration

### 4.1 Replace `src/frontend/hooks/useMeeting.ts`

**New (LiveKit):**
```typescript
"use client";

import {
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useTracks,
  useChat,
  useConnectionState,
  useRoomInfo,
} from "@livekit/components-react";
import {
  RoomEvent,
  ConnectionState,
  Track,
  LocalParticipant,
  RemoteParticipant,
} from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useMeetingStore from "../zustand/useMeetingStore";
import { getAccessToken } from "@/frontend/services/broadcasting";
import { getMeetingInfo } from "@backend/services/meeting";
import { toast } from "@frontend/hooks/useToast";

export const useMeeting = () => {
  const router = useRouter();
  const { mediaStatus, setMediaStatus, setShowChatWidget, showChatWidget } =
    useMeetingStore();

  // These hooks only work inside LiveKitRoom context
  // Return safe defaults when outside room context
  const [isInRoom, setIsInRoom] = useState(false);

  return {
    mediaStatus,
    setMediaStatus,
    showChatWidget,
    setShowChatWidget,
    isInRoom,
    setIsInRoom,
  };
};

// Separate hook for use inside LiveKitRoom context
export const useActiveMeeting = () => {
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const { send: sendMessage, chatMessages } = useChat();
  const router = useRouter();
  const { mediaStatus, setMediaStatus, setShowChatWidget, showChatWidget } =
    useMeetingStore();

  const isConnected = connectionState === ConnectionState.Connected;

  // Get local participant role from metadata
  const localPeerRole = localParticipant?.permissions?.canPublish
    ? (localParticipant?.permissions?.roomAdmin ? "host" : "guest")
    : "viewer";

  // Find dominant speaker
  const dominantSpeaker = participants.find(p => p.isSpeaking);

  // Toggle local video
  const toggleVideo = useCallback(async () => {
    if (localParticipant) {
      const enabled = localParticipant.isCameraEnabled;
      await localParticipant.setCameraEnabled(!enabled);
      setMediaStatus({ video: !enabled });
    }
  }, [localParticipant, setMediaStatus]);

  // Toggle local audio
  const toggleAudio = useCallback(async () => {
    if (localParticipant) {
      const enabled = localParticipant.isMicrophoneEnabled;
      await localParticipant.setMicrophoneEnabled(!enabled);
      setMediaStatus({ audio: !enabled });
    }
  }, [localParticipant, setMediaStatus]);

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    await room.disconnect();
    router.push("/");
  }, [room, router]);

  // End meeting (host only - disconnects everyone)
  const endMeeting = useCallback(async () => {
    // Note: LiveKit doesn't have a direct "end room" API from client
    // You'd need to call your server to delete the room
    await room.disconnect();
    router.push("/");
  }, [room, router]);

  // Send chat message
  const sendBroadcastMessage = useCallback(async (text: string) => {
    if (sendMessage) {
      await sendMessage(text);
    }
  }, [sendMessage]);

  // Sync media status with LiveKit
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(mediaStatus.video);
      localParticipant.setMicrophoneEnabled(mediaStatus.audio);
    }
  }, [localParticipant, mediaStatus]);

  // Listen for room events
  useEffect(() => {
    const handleDisconnected = () => {
      toast({
        title: "Meeting ended",
        description: "The meeting has been ended by the host",
        variant: "default",
      });
      router.push("/");
    };

    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room, router]);

  return {
    isConnected,
    participants,
    localParticipant,
    localPeerRole,
    dominantSpeaker,
    mediaStatus,
    setMediaStatus,
    toggleVideo,
    toggleAudio,
    leaveMeeting,
    endMeeting,
    sendBroadcastMessage,
    messages: chatMessages,
    showChatWidget,
    setShowChatWidget,
  };
};

// Join room helper (called before entering LiveKitRoom context)
export async function joinRoom(
  roomId: string,
  userName: string,
  userId: string
): Promise<string> {
  const roomInfo = await getMeetingInfo(roomId);
  const isHost = Boolean(userId) && userId === roomInfo?.broadcaster;

  const { token } = await getAccessToken(roomId, userId, isHost);
  return token;
}
```

---

## Phase 5: Component Migration

### 5.1 Replace `src/frontend/components/MeetingMemberStream.tsx`

**New (LiveKit):**
```typescript
"use client";

import { useRef, useEffect } from "react";
import {
  VideoTrack,
  useTrackRefContext,
  TrackRefContext,
  ParticipantTile,
} from "@livekit/components-react";
import { Track, Participant } from "livekit-client";
import clsx from "clsx";

interface Props {
  participant: Participant;
  height?: number;
  totalPeers?: number;
}

const MeetingMemberStream = ({ participant, height = 300, totalPeers = 1 }: Props) => {
  const isSpeaking = participant.isSpeaking;
  const videoTrack = participant.getTrackPublication(Track.Source.Camera);

  return (
    <div
      className={clsx(
        "relative rounded-xl overflow-hidden bg-slate-800",
        isSpeaking && "ring-2 ring-green-500"
      )}
      style={{ height }}
    >
      {videoTrack?.track ? (
        <VideoTrack
          trackRef={{
            participant,
            publication: videoTrack,
            source: Track.Source.Camera,
          }}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center">
            <span className="text-2xl text-white">
              {participant.identity?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-sm">
        {participant.identity || "Unknown"}
        {participant.isLocal && " (You)"}
      </div>
    </div>
  );
};

export default MeetingMemberStream;
```

### 5.2 Update `src/frontend/components/Livestream.tsx`

**New (LiveKit):**
```typescript
"use client";

import { useActiveMeeting } from "@frontend/hooks/useMeeting";
import MeetingControls from "./MeetingControls";
import MeetingMemberStream from "./MeetingMemberStream";
import MeetingChatWidget from "./MeetingChatWidget";
import clsx from "clsx";

const Livestream = () => {
  const { participants, showChatWidget } = useActiveMeeting();

  const gridCols = participants.length <= 1
    ? "grid-cols-1"
    : participants.length <= 4
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 flex">
        <div className={clsx("flex-1 grid gap-4 p-4", gridCols)}>
          {participants.map((participant) => (
            <MeetingMemberStream
              key={participant.identity}
              participant={participant}
              totalPeers={participants.length}
            />
          ))}
        </div>

        {showChatWidget && (
          <div className="w-80 border-l border-slate-700">
            <MeetingChatWidget />
          </div>
        )}
      </div>

      <MeetingControls />
    </div>
  );
};

export default Livestream;
```

### 5.3 Update `src/frontend/components/MeetingControls.tsx`

**Changes needed:**
- Replace `useMeeting()` with `useActiveMeeting()`
- Use `toggleVideo()` and `toggleAudio()` instead of `setMediaStatus()`

### 5.4 Update `src/frontend/components/MeetingChatWidget.tsx`

**Changes needed:**
- Replace `messages` array structure (LiveKit uses different format)
- Replace `localPeer?.id` with `localParticipant?.identity`

### 5.5 Update `src/app/live/[roomId]/room-client.tsx`

**New (LiveKit):**
```typescript
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@frontend/zustand/useAuthStore";
import { joinRoom } from "@frontend/hooks/useMeeting";
import { LiveKitRoomWrapper } from "@frontend/providers/LiveKitProvider";
import Livestream from "@frontend/components/Livestream";
import { Loader2 } from "lucide-react";

interface Props {
  roomId: string;
}

const RoomClient = ({ roomId }: Props) => {
  const { user } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId && user) {
      joinRoom(roomId, user.displayName || "User", user.uid)
        .then(setToken)
        .catch((err) => setError(err.message));
    }
  }, [roomId, user]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <LiveKitRoomWrapper token={token}>
      <Livestream />
    </LiveKitRoomWrapper>
  );
};

export default RoomClient;
```

---

## Phase 6: Webhook Migration

### 6.1 Replace `src/app/api/webhook/100ms/route.ts`

Rename to `src/app/api/webhook/livekit/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { updateMeeting } from "@backend/services/meeting";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return Response.json({ error: "Missing authorization" }, { status: 401 });
    }

    const event = await receiver.receive(body, authHeader);

    switch (event.event) {
      case "room_finished": {
        const room = event.room;
        if (room) {
          await updateMeeting({
            room_id: room.name,
            session_duration: room.activeRecording
              ? Math.floor((Date.now() - room.creationTime) / 1000)
              : 0,
          });
        }
        break;
      }

      case "egress_ended": {
        // Handle recording completion
        const egress = event.egressInfo;
        if (egress?.file?.filename) {
          await updateMeeting({
            room_id: egress.roomName,
            recording_info: {
              enabled: true,
              is_recording_ready: true,
              recording_storage_path: egress.file.filename,
            },
          });
        }
        break;
      }
    }

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
```

---

## Phase 7: Type Definitions

### 7.1 Update `src/types/entities.d.ts`

**Remove:**
```typescript
import * as HMS from "@100mslive/server-sdk";
type Meeting = HMS.Room.Object;
```

**Add:**
```typescript
interface Meeting {
  id: string;
  name: string;
  broadcaster: string;
  created_at: string;
  session_duration?: number;
  recording_info?: {
    enabled: boolean;
    is_recording_ready?: boolean;
    recording_storage_path?: string;
  };
}

interface LiveKitRoomWebhook {
  name: string;
  sid: string;
  creationTime: number;
  turnPassword: string;
  enabledCodecs: Array<{ mime: string }>;
  metadata: string;
  numParticipants: number;
  numPublishers: number;
  activeRecording: boolean;
}

interface LiveKitEgressWebhook {
  egressId: string;
  roomId: string;
  roomName: string;
  status: number;
  file?: {
    filename: string;
    startedAt: number;
    endedAt: number;
    duration: number;
    size: number;
    location: string;
  };
}
```

---

## Phase 8: Environment & Configuration

### 8.1 Update `.env.example`

```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

### 8.2 Update `CLAUDE.md`

Replace references to 100ms with LiveKit.

---

## Phase 9: Testing Checklist

- [ ] Room creation works
- [ ] Token generation works
- [ ] Joining a room works
- [ ] Video/audio tracks render
- [ ] Mute/unmute works
- [ ] Video toggle works
- [ ] Chat messaging works
- [ ] Multiple participants can join
- [ ] Host can end meeting
- [ ] Guest can leave meeting
- [ ] Webhooks receive events
- [ ] Recording works (if enabled)

---

## File Change Summary

| File | Action |
|------|--------|
| `package.json` | Update dependencies |
| `.env` / `.env.example` | Update env vars |
| `src/frontend/services/broadcasting.ts` | Rewrite |
| `src/frontend/providers/HMSProvider.tsx` | Rename & rewrite → `LiveKitProvider.tsx` |
| `src/app/layout.tsx` | Update import |
| `src/frontend/hooks/useMeeting.ts` | Rewrite |
| `src/frontend/components/MeetingMemberStream.tsx` | Rewrite |
| `src/frontend/components/Livestream.tsx` | Update |
| `src/frontend/components/MeetingControls.tsx` | Update |
| `src/frontend/components/MeetingChatWidget.tsx` | Update |
| `src/app/live/[roomId]/room-client.tsx` | Rewrite |
| `src/app/api/webhook/100ms/route.ts` | Move & rewrite → `livekit/route.ts` |
| `src/types/entities.d.ts` | Update types |
| `CLAUDE.md` | Update documentation |

---

## LiveKit Cloud Setup

1. Create account at [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a new project
3. Copy API Key and Secret
4. Configure webhook URL: `https://your-domain.com/api/webhook/livekit`
5. Enable desired features (recording, etc.)

---

## Rollback Plan

Keep a git branch with the 100ms implementation until LiveKit is fully tested:

```bash
git checkout -b backup/100ms-implementation
git checkout main
git checkout -b feature/livekit-migration
```

---

## Benefits After Migration

1. **5x more free minutes** (50k vs 10k)
2. **React 19 compatible** - can upgrade React
3. **Open source** - matches project license philosophy
4. **Self-hosting option** - reduce costs further if needed
5. **Better documentation** - easier for contributors
6. **Active community** - faster issue resolution
