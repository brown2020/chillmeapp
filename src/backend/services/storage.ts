import axios from "axios";
import stream from "stream";
import { adminBucket } from "@/backend/lib/firebase";
import { v4 } from "uuid";
import { File } from "@google-cloud/storage";

function uploadRecordingToStorage(
  fileUrl: string,
  destinationFolder: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const response = await axios({
          url: fileUrl,
          method: "GET",
          responseType: "stream",
        });

        const passThroughStream = new stream.PassThrough();
        const filename = `${v4()}.mp4`;
        const storagePath = `${destinationFolder}${filename}`;
        const file = adminBucket.file(storagePath, {});

        const uploadStream = file.createWriteStream({
          metadata: {
            contentType: response.headers["content-type"],
            contentDisposition: `attachment; filename="${filename}"`,
          },
        });

        response.data.on("error", (error: Error) => reject(error));
        passThroughStream.on("error", (error: Error) => reject(error));

        response.data.pipe(passThroughStream);
        passThroughStream.pipe(uploadStream);

        uploadStream.on("finish", () => resolve(file));
        uploadStream.on("error", (error: Error) => reject(error));
      } catch (error) {
        reject(error);
      }
    })();
  });
}

export { uploadRecordingToStorage };
