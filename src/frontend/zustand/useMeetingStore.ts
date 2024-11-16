import { composeStore } from "@/utils/storeComposer";

type MeetingStore = {
  mediaStatus: {
    audio: boolean;
    video: boolean;
  };
  showChatWidget: boolean;
  setMediaStatus: (update: Partial<MeetingStore["mediaStatus"]>) => void;
  setShowChatWidget: (payload: boolean) => void;
};

const useMeetingStore = composeStore<MeetingStore>(
  (set) => ({
    mediaStatus: {
      audio: true,
      video: false,
    },
    showChatWidget: true,
    setShowChatWidget: (payload: boolean) =>
      set(() => ({
        showChatWidget: payload,
      })),
    setMediaStatus: (update: Partial<MeetingStore["mediaStatus"]>) =>
      set((state) => ({
        mediaStatus: {
          ...state.mediaStatus,
          ...update, // Spread the update object here
        },
      })),
  }),
  {
    name: "MeetingStore",
  },
);

export default useMeetingStore;
