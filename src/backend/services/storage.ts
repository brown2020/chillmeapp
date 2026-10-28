import { Transform } from "node:stream";
import axios from "axios";
import { adminBucket } from "@/backend/lib/firebase";
import { isSafeRecordingPath } from "@/utils/recording-paths";
import { assertSafeDownloadUrl } from "@/utils/safe-remote-url";

const MAX_RECORDING_BYTES = 1024 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 120_000;

async function uploadRecordingToStorage(
  fileUrl: string,
  storagePath: string,
): Promise<string> {
  if (!isSafeRecordingPath(storagePath)) {
    throw new Error("Invalid recording path");
  }

  await assertSafeDownloadUrl(fileUrl);

  const response = await axios({
    url: fileUrl,
    method: "GET",
    responseType: "stream",
    maxRedirects: 0,
    timeout: DOWNLOAD_TIMEOUT_MS,
    maxContentLength: MAX_RECORDING_BYTES,
    maxBodyLength: MAX_RECORDING_BYTES,
  });

  const declaredLength = Number(response.headers["content-length"]);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RECORDING_BYTES) {
    response.data.destroy();
    throw new Error("Recording exceeds size limit");
  }

  const file = adminBucket.file(storagePath);
  let received = 0;
  const limiter = new Transform({
    transform(chunk, _encoding, callback) {
      received += chunk.length;
      if (received > MAX_RECORDING_BYTES) {
        callback(new Error("Recording exceeds size limit"));
        return;
      }
      callback(null, chunk);
    },
  });

  await new Promise<void>((resolve, reject) => {
    const uploadStream = file.createWriteStream({
      metadata: {
        contentType: "video/mp4",
        contentDisposition: `attachment; filename="${storagePath.split("/").pop()}"`,
      },
    });

    response.data.pipe(limiter).pipe(uploadStream);
    uploadStream.on("finish", () => resolve());
    uploadStream.on("error", reject);
    limiter.on("error", reject);
    response.data.on("error", reject);
  });

  return storagePath;
}

export { uploadRecordingToStorage };
