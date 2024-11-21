import {
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectLocalPeerRole,
  selectPeers,
  selectDominantSpeaker,
  selectLocalPeer,
  selectHMSMessages,
  selectLocalPeerID,
  selectRoomID,
  HMSLogLevel,
} from "@100mslive/react-sdk";
import { getAppToken } from "@/backend/services/broadcasting";
import { getMeetingInfo } from "@backend/services/meeting";
import { deductUserCredits } from "@backend/services/user";
import { useCallback } from "react";
import useMeetingStore from "../zustand/useMeetingStore";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useHMSNotifications } from "@100mslive/react-sdk";
import { toast } from "@frontend/hooks/useToast";
import { useAuthStore } from "../zustand/useAuthStore";

const useMeeting = () => {
  const hmsActions = useHMSActions();
  const { mediaStatus, setMediaStatus, setShowChatWidget, showChatWidget } =
    useMeetingStore();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const router = useRouter();
  const notification = useHMSNotifications();
  const meetingNotification = useMemo(() => notification, [notification]);
  const localPeerRole = useHMSStore(selectLocalPeerRole);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const messages = useHMSStore(selectHMSMessages);
  const localPeerId = useHMSStore(selectLocalPeerID);
  const roomId = useHMSStore(selectRoomID);
  const { user } = useAuthStore();

  useEffect(() => {
    hmsActions.setLogLevel(HMSLogLevel.NONE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateHMSMediaStore = useCallback(async () => {
    await Promise.all([
      hmsActions.setLocalVideoEnabled(mediaStatus.video),
      // hmsActions.setLocalAudioEnabled(mediaStatus.audio),
    ]);
  }, [mediaStatus, hmsActions]);

  const leaveMeeting = useCallback(async () => {
    try {
      await hmsActions.leave();
    } finally {
      router.push("/");
    }
  }, [hmsActions, router]);

  const endMeeting = useCallback(async () => {
    try {
      await hmsActions.endRoom(true, "meeting-finished");
    } finally {
      router.push("/");
    }
  }, [hmsActions, router]);

  const sendBroadcastMessage = async (text: string) => {
    try {
      await hmsActions.sendBroadcastMessage(text);
    } catch {
      console.log("Error occured in sending message");
    }
  };

  useEffect(() => {
    updateHMSMediaStore();
  }, [updateHMSMediaStore]);

  const joinRoom = async (roomId: string, userName: string, userId: string) => {
    try {
      const roomInfo = await getMeetingInfo(roomId);
      const role = userId === roomInfo?.broadcaster ? "host" : "guest";
      const tokenResponse = await getAppToken(roomId, userName, role);
      // Step 3: Join the room
      await hmsActions.join({
        userName: userName,
        authToken: tokenResponse.appToken.token,
      });
    } catch (err) {
      const error = err as { description: string } | Error;

      toast({
        title: "Error in joining room",
        description:
          "description" in error
            ? error.description
            : "room not available to join",
        variant: "error",
      });
      router.push("/");
    }
  };

  const handleCreditsDeduction = useCallback(
    (secondsGap: number) =>
      deductUserCredits(user?.uid as string, roomId, secondsGap),
    [roomId, user?.uid],
  );

  return {
    mediaStatus,
    isConnected,
    meetingNotification,
    localPeerRole,
    peers,
    localPeer,
    dominantSpeaker,
    setMediaStatus,
    joinRoom,
    updateHMSMediaStore,
    leaveMeeting,
    endMeeting,
    setShowChatWidget,
    showChatWidget,
    sendBroadcastMessage,
    messages,
    localPeerId,
    handleCreditsDeduction,
  };
};

export { useMeeting };
