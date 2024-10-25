import {
  useHMSActions,
  useHMSStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectIsConnectedToRoom,
} from "@100mslive/react-sdk";
import { getAppToken } from "@/frontend/services/broadcasting";
import { useCallback } from "react";
import useMeetingStore from "../zustand/useMeetingStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const useMeeting = () => {
  const hmsActions = useHMSActions();
  const audioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const videoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const { mediaStatus, setMediaStatus } = useMeetingStore();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const router = useRouter();

  const updateHMSMediaStore = useCallback(async () => {
    // console.log("Previous", { audioEnabled, videoEnabled });
    await Promise.all([
      hmsActions.setLocalVideoEnabled(mediaStatus.video),
      // hmsActions.setLocalAudioEnabled(mediaStatus.audio),
    ]);
    // console.log("Updated", { audioEnabled, videoEnabled });
  }, [mediaStatus, hmsActions, audioEnabled, videoEnabled]);

  const leaveMeeting = useCallback(() => {
    try {
      hmsActions.leave();
    } finally {
      router.push("/");
    }
  }, [hmsActions, router]);

  useEffect(() => {
    updateHMSMediaStore();
  }, [updateHMSMediaStore]);

  async function _joinRoom(roomId: string, role: string, userName: string) {
    const tokenResponse = await getAppToken(roomId, "user", role);

    if (tokenResponse.error) {
      throw new Error(`Problem joining room: ${tokenResponse.error}`);
    }

    if (!tokenResponse.appToken) {
      throw new Error("Problem joining room: App token is undefined.");
    }

    // Step 3: Join the room
    hmsActions.join({
      userName: userName,
      authToken: tokenResponse.appToken.token,
    });
  }

  const joinRoom = useCallback(_joinRoom, [hmsActions]);

  return {
    mediaStatus,
    setMediaStatus,
    joinRoom,
    updateHMSMediaStore,
    leaveMeeting,
    isConnected,
  };
};

export { useMeeting };
