import * as HMS from "@100mslive/server-sdk"; // Correct wildcard import

type Meeting = HMS.Room.Object;

type MeetingSnapShot = Omit<Meeting, "created_at"> & {
  broadcaster: string;
  doc_id: string;
  created_at: { seconds: number };
};

type TabGroupItem = {
  label: string;
  value: string;
};
