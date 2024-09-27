import { MeetingSnapShot } from "@/types/entities";
import { findUserById } from "@/frontend/services/user";
import { useEffect, useState } from "react";
import { formatSeconds } from "@/utils/dateUtils";
import { fetchRecording } from "@/frontend/services/meeting";

type Props = {
  data: MeetingSnapShot;
};

const MeetingCard = ({ data }: Props) => {
  const [hostDisplayName, setHostDisplayName] = useState<string>("");
  const [recordingUrl, setRecordingUrl] = useState<string>("");

  useEffect(() => {
    (async () => {
      const result = await findUserById(data.broadcaster);
      setHostDisplayName(result.authDisplayName);
      if (data.recording_info?.is_recording_ready) {
        const recordingFileUrl = await fetchRecording(
          data.recording_info.recording_storage_path,
        );
        setRecordingUrl(recordingFileUrl);
      }
    })();
  }, []);

  return (
    <div className="relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8 bg-white w-full">
      <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>

      <div className="sm:flex sm:justify-between sm:gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl uppercase">
            {data.name}
          </h3>

          <p className="mt-1 text-xs font-medium text-gray-600">
            {`Host: ${hostDisplayName}`}
          </p>
        </div>
        <div>
          {recordingUrl && (
            <a
              href={recordingUrl}
              target="_blnk"
              className="mt-1 text-sm font-medium text-gray-600"
            >
              Watch Recording
            </a>
          )}
        </div>
      </div>

      <dl className="mt-6 flex gap-4 sm:gap-6">
        <div className="flex flex-col-reverse">
          <dt className="text-sm font-medium text-gray-600">Created</dt>
          <dd className="text-xs text-gray-500">
            {new Date(data.created_at.seconds * 1000).toDateString()}
          </dd>
        </div>

        <div className="flex flex-col-reverse">
          <dt className="text-sm font-medium text-gray-600">
            Meeting Duration
          </dt>
          <dd className="text-xs text-gray-500">
            {formatSeconds(data.session_duration)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default MeetingCard;
