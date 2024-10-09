import { useHMSActions } from "@100mslive/react-sdk";
import { getAppToken } from "@/frontend/services/broadcasting";
import { useCallback } from "react";

const useMeeting = () => {
  const hmsActions = useHMSActions();

  async function _joinRoom(roomId: string, role: string, userName: string) {
    console.log("Joining romt with id", roomId);
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
    joinRoom,
  };
};

export default useMeeting;
