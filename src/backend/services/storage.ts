import axios from "axios";
import stream from "stream";
import { adminBucket } from "@/backend/lib/firebase";
import { v4 } from "uuid";

async function uploadRecordingToStorage(
  fileUrl: string,
  destinationFolder: string,
): Promise<string> {
  const response = await axios({
    url: fileUrl,
    method: "GET",
    responseType: "stream",
  });

  const passThroughStream = new stream.PassThrough();
  response.data.pipe(passThroughStream);

  const filename = `${v4()}.mp4`;
  const storagePath = `${destinationFolder}${filename}`;
  const file = adminBucket.file(storagePath);

  const contentType = response.headers["content-type"];

  await new Promise<void>((resolve, reject) => {
    const uploadStream = file.createWriteStream({
      metadata: {
        contentType:
          typeof contentType === "string" ? contentType : "video/mp4",
        contentDisposition: `attachment; filename="${filename}"`,
      },
    });

    passThroughStream.pipe(uploadStream);

    uploadStream.on("finish", () => resolve());
    uploadStream.on("error", reject);
    passThroughStream.on("error", reject);
  });

  return storagePath;
}

export { uploadRecordingToStorage };
