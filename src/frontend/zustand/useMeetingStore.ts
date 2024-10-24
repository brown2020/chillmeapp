import { create } from "zustand";

type MeetingStore = {
  mediaStatus: {
    audio: boolean;
    video: boolean;
  };
  setMediaStatus: (update: Partial<MeetingStore["mediaStatus"]>) => void;
};

const useMeetingStore = create<MeetingStore>((set) => ({
  mediaStatus: {
    audio: true,
    video: false,
  },
  setMediaStatus: (update: Partial<MeetingStore["mediaStatus"]>) =>
    set((state) => ({
      mediaStatus: {
        ...state.mediaStatus,
        ...update, // Spread the update object here
      },
    })),
}));

export default useMeetingStore;
