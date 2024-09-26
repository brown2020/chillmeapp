import axios from "axios";
import stream from "stream";
import { adminBucket } from "@/config/firebase/firebaseAdmin";
import { v4 } from "uuid";

function uploadRecordingToStorage(
  fileUrl: string,
  destinationFolder: string,
): Promise<boolean> {
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

    const storagePath = `${destinationFolder}${v4()}.mp4`;
    // Upload to Firebase Storage
    const file = adminBucket.file(storagePath);

    const uploadStream = file.createWriteStream({
      metadata: {
        contentType: response.headers["content-type"],
      },
    });

    passThroughStream.pipe(uploadStream);
    uploadStream.on("finish", () => {
      resolve(true);
    });

    uploadStream.on("error", (error) => {
      reject(error);
    });
  });
  return result as Promise<boolean>;
}

export { uploadRecordingToStorage };
