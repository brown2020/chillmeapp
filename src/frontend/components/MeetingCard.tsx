"use client";

import { MeetingSnapShot } from "@/types/entities";
import { getUserById } from "@/backend/services/auth";
import { useEffect, useState } from "react";
import { formatSeconds } from "@/utils/dateUtils";
import { fetchRecording } from "@/frontend/services/meeting";
import { useRouter } from "next/navigation";

type Props = {
  data: MeetingSnapShot;
};

const MeetingCard = ({ data }: Props) => {
  const router = useRouter();
  const [hostDisplayName, setHostDisplayName] = useState<string>("");
  const [recordingUrl, setRecordingUrl] = useState<string>("");
  const [recordingStatus, setRecordingStatus] = useState<string | null>(null);

  useEffect(() => {
    const aggregateMeetingData = async () => {
      const result = await getUserById(data.broadcaster);
      setHostDisplayName(result.displayName || "Unknown");

      if (!data.recording_info?.enabled) {
        setRecordingStatus("not-available");
        return;
      }

      if (!data.recording_info?.is_recording_ready) {
        setRecordingStatus("processing");
        return;
      }

      if (!data.recording_info.recording_storage_path) {
        setRecordingStatus("not-available");
        return;
      }

      const recordingFileUrl = await fetchRecording(
        data.recording_info.recording_storage_path,
      );
      setRecordingUrl(recordingFileUrl);
      setRecordingStatus("available");
    };

    aggregateMeetingData();
  }, [data.broadcaster, data.recording_info]);

  const viewRecording = (url: string) => {
    const encodedUrl = btoa(url);
    router.push(`/recording?source=${encodedUrl}`);
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
          {recordingUrl ? (
            <button
              onClick={() => viewRecording(recordingUrl)}
              className="mt-1 text-sm font-medium text-primary hover:underline"
            >
              Watch Recording
            </button>
          ) : recordingStatus === "processing" ? (
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
            {new Date(data.created_at.seconds * 1000).toDateString()}
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
