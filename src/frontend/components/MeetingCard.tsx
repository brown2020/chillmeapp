"use client";

import { MeetingSnapShot } from "@/types/entities";
import { formatMeetingCreatedAt, formatSeconds } from "@/utils/dateUtils";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";

type Props = {
  data: MeetingSnapShot;
};

const MeetingCard = ({ data }: Props) => {
  const user = useAuthStore((state) => state.user);
  const hostDisplayName =
    user?.uid && user.uid === data.broadcaster
      ? user.displayName || "Unknown"
      : "Unknown";
  const recordingPath = data.recording_info?.recording_storage_path;
  const recordingReady = Boolean(
    data.recording_info?.enabled &&
    data.recording_info?.is_recording_ready &&
    recordingPath,
  );

  const viewRecording = () => {
    if (!recordingPath) return;
    window.location.assign(
      `/recording?path=${encodeURIComponent(recordingPath)}`,
    );
  };

  return (
    <div className="relative block overflow-hidden rounded-lg border border-border p-4 sm:p-6 lg:p-8 bg-card w-full">
      <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>

      <div className="sm:flex sm:justify-between sm:gap-4">
        <div>
          <h3 className="text-sm font-bold text-card-foreground sm:text-sm uppercase">
            {data.name}
          </h3>

          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {`Host: ${hostDisplayName}`}
          </p>
        </div>
        <div>
          {recordingReady ? (
            <button
              onClick={viewRecording}
              className="mt-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Watch Recording
            </button>
          ) : data.recording_info?.enabled &&
            !data.recording_info?.is_recording_ready ? (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Processing Recording
            </p>
          ) : null}
        </div>
      </div>

      <dl className="mt-6 flex gap-4 sm:gap-6">
        <div className="flex flex-col-reverse">
          <dt className="text-sm font-medium text-muted-foreground">Created</dt>
          <dd className="text-xs text-muted-foreground">
            {formatMeetingCreatedAt(data.created_at)}
          </dd>
        </div>

        <div className="flex flex-col-reverse">
          <dt className="text-sm font-medium text-muted-foreground">
            Meeting Duration
          </dt>
          <dd className="text-xs text-muted-foreground">
            {formatSeconds(data.session_duration ?? 0)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default MeetingCard;
