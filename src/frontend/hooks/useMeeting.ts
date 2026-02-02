"use client";

import {
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useChat,
  useConnectionState,
} from "@livekit/components-react";
import { RoomEvent, ConnectionState, Track } from "livekit-client";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import useMeetingStore from "../zustand/useMeetingStore";
import { getAccessToken } from "@/frontend/services/broadcasting";
import { getMeetingInfo } from "@backend/services/meeting";
import { toast } from "@frontend/hooks/useToast";

/**
 * Helper function to get access token for joining a room.
 * Called before entering the LiveKit room context.
 */
export async function getJoinToken(
  roomId: string,
  userName: string,
  userId: string,
): Promise<string> {
  if (!roomId) throw new Error("Missing roomId");

  const roomInfo = await getMeetingInfo(roomId);
  const isHost = Boolean(userId) && userId === roomInfo?.broadcaster;

  const { token } = await getAccessToken(roomId, userId, isHost);
  return token;
}

/**
 * Full meeting hook - only works inside LiveKitRoom context.
 * Use this for components that are rendered inside an active meeting.
 */
export const useMeeting = () => {
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const { send: sendChatMessage, chatMessages } = useChat();
  const router = useRouter();
  const { mediaStatus, setMediaStatus, setShowChatWidget, showChatWidget } =
    useMeetingStore();

  const isConnected = connectionState === ConnectionState.Connected;

  // Determine if current user is host based on permissions
  // Check if user can publish and has elevated permissions
  const isHost =
    (localParticipant?.permissions as { roomAdmin?: boolean } | undefined)
      ?.roomAdmin ?? false;
  const localPeerRole = { name: isHost ? "host" : "guest" };

  // Find the currently speaking participant
  const dominantSpeaker = participants.find((p) => p.isSpeaking) ?? null;

  // Get local participant info
  const localPeer = localParticipant
    ? {
        id: localParticipant.identity,
        name: localParticipant.name || localParticipant.identity,
        isLocal: true,
        videoTrack: localParticipant.getTrackPublication(Track.Source.Camera)
          ?.trackSid,
        audioTrack: localParticipant.getTrackPublication(
          Track.Source.Microphone,
        )?.trackSid,
      }
    : null;

  // Map participants to a consistent format
  const peers = participants.map((p) => ({
    id: p.identity,
    name: p.name || p.identity,
    isLocal: p.isLocal,
    videoTrack: p.getTrackPublication(Track.Source.Camera)?.trackSid,
    audioTrack: p.getTrackPublication(Track.Source.Microphone)?.trackSid,
    isSpeaking: p.isSpeaking,
    participant: p, // Keep original for video rendering
  }));

  // Map chat messages to a consistent format
  const messages = chatMessages.map((msg) => ({
    id: msg.id,
    message: msg.message,
    sender: msg.from?.identity,
    senderName: msg.from?.name || msg.from?.identity,
    time: msg.timestamp,
  }));

  // Toggle local video
  const toggleVideo = useCallback(async () => {
    if (localParticipant) {
      const newState = !localParticipant.isCameraEnabled;
      await localParticipant.setCameraEnabled(newState);
      setMediaStatus({ video: newState });
    }
  }, [localParticipant, setMediaStatus]);

  // Toggle local audio
  const toggleAudio = useCallback(async () => {
    if (localParticipant) {
      const newState = !localParticipant.isMicrophoneEnabled;
      await localParticipant.setMicrophoneEnabled(newState);
      setMediaStatus({ audio: newState });
    }
  }, [localParticipant, setMediaStatus]);

  // Leave meeting (for guests)
  const leaveMeeting = useCallback(async () => {
    try {
      await room.disconnect();
    } finally {
      router.push("/");
    }
  }, [room, router]);

  // End meeting (for hosts - disconnects everyone)
  const endMeeting = useCallback(async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Send a data message to notify all participants
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify({ type: "meeting-ended" }));
      await room.localParticipant.publishData(data, {
        reliable: true,
      });
      // Wait briefly to allow message to be sent before disconnecting
      await delay(500);
      await room.disconnect();
      router.push("/");
    } catch {
      await room.disconnect();
      router.push("/");
    }
  }, [room, router]);

  // Send chat message
  const sendBroadcastMessage = useCallback(
    async (text: string) => {
      if (sendChatMessage && text.trim()) {
        try {
          await sendChatMessage(text);
        } catch {
          console.error("Error sending message");
          toast({
            title: "Message failed",
            description: "Unable to send your message. Please try again.",
            variant: "error",
          });
        }
      }
    },
    [sendChatMessage],
  );

  // Sync initial media status with LiveKit when connected
  useEffect(() => {
    if (isConnected && localParticipant) {
      localParticipant.setCameraEnabled(mediaStatus.video);
      localParticipant.setMicrophoneEnabled(mediaStatus.audio);
    }
  }, [isConnected, localParticipant, mediaStatus.video, mediaStatus.audio]);

  // Listen for room disconnect events
  useEffect(() => {
    const handleDisconnected = () => {
      toast({
        title: "Disconnected",
        description: "You have been disconnected from the meeting",
        variant: "default",
      });
    };

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        if (data.type === "meeting-ended") {
          toast({
            title: "Meeting ended",
            description: "The host has ended the meeting",
            variant: "default",
          });
          room.disconnect();
          router.push("/");
        }
      } catch {
        // Not a JSON message, ignore
      }
    };

    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, router]);

  return {
    // Connection state
    isConnected,

    // Participants
    peers,
    localPeer,
    localPeerId: localParticipant?.identity,
    localPeerRole,
    dominantSpeaker,
    participants, // Raw LiveKit participants for video rendering

    // Media controls
    mediaStatus,
    setMediaStatus,
    toggleVideo,
    toggleAudio,

    // Meeting actions
    leaveMeeting,
    endMeeting,

    // Chat
    messages,
    sendBroadcastMessage,

    // UI state
    showChatWidget,
    setShowChatWidget,

    // For backward compatibility with notification checks
    meetingNotification: null,
  };
};
