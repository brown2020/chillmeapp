import {
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectLocalPeerRole,
  selectPeers,
  selectDominantSpeaker,
  selectLocalPeer,
} from "@100mslive/react-sdk";
import { getAppToken } from "@/frontend/services/broadcasting";
import { getMeetingInfo } from "@backend/services/meeting";
import { useCallback } from "react";
import useMeetingStore from "../zustand/useMeetingStore";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useHMSNotifications } from "@100mslive/react-sdk";
import { toast } from "@frontend/hooks/useToast";

const useMeeting = () => {
  const hmsActions = useHMSActions();
  const { mediaStatus, setMediaStatus } = useMeetingStore();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const router = useRouter();
  const notification = useHMSNotifications();
  const meetingNotification = useMemo(() => notification, [notification]);
  const localPeerRole = useHMSStore(selectLocalPeerRole);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);

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
  };
};

export { useMeeting };
