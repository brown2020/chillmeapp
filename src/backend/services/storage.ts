import axios from "axios";
import stream from "stream";
import { adminBucket } from "@/backend/lib/firebase";
import { v4 } from "uuid";
import { File } from "@google-cloud/storage";

function uploadRecordingToStorage(
  fileUrl: string,
  destinationFolder: string,
): Promise<File> {
  const result = new Promise(async (resolve, reject) => {
    // Get the file as a stream
    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "stream",
    });

    // Create a PassThrough stream to pipe the download stream to Firebase upload
    const passThroughStream = new stream.PassThrough();

    // Pipe the response stream to PassThrough stream
    response.data.pipe(passThroughStream);

    const filename = `${v4()}.mp4`;
    const storagePath = `${destinationFolder}${filename}`;
    // Upload to Firebase Storage
    const file = adminBucket.file(storagePath, {});

    const uploadStream = file.createWriteStream({
      metadata: {
        contentType: response.headers["content-type"],
        contentDisposition: `attachment; filename="${filename}"`,
      },
    });

    passThroughStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      resolve(file);
    });

    uploadStream.on("error", (error) => {
      reject(error);
    });
  });
  return result as Promise<File>;
}

export { uploadRecordingToStorage };
