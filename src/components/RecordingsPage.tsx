"use client";

import { useState, useEffect } from "react";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "@firebase/firestore";

import { deleteObject, ref } from "@firebase/storage";
import { updateDoc } from "firebase/firestore";
import { useAuthStore } from "@/zustand/useAuthStore";
import { db, storage } from "@/config/firebase/firebaseClient";

export type VideoType = {
  id: string;
  downloadUrl: string;
  createdAt: Timestamp;
  filename: string;
  showOnProfile: boolean;
  botId?: string;
  botName?: string;
  modelId?: string;
  modelName?: string;
  language?: string;
  languageCode?: string;
};

export default function RecordingsPage() {
  const uid = useAuthStore((state) => state.uid);

  const [videos, setVideos] = useState<VideoType[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<VideoType | null>(null);

  useEffect(() => {
    if (!uid) return;
    const fetchVideos = async () => {
      try {
        const videosRef = collection(db, `users/${uid}/botcasts`);
        const q = query(videosRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const videosData = querySnapshot.docs.map((doc) => ({
          id: doc.id || doc.data().id || "",
          downloadUrl: doc.data().downloadUrl || "",
          createdAt: doc.data().createdAt || Timestamp.now(),
          filename: doc.data().filename || "",
          showOnProfile: doc.data().showOnProfile || false,
          botId: doc.data().botId || "",
          botName: doc.data().botName || "",
          modelId: doc.data().modelId || "",
          modelName: doc.data().modelName || "",
          language: doc.data().language || "",
          languageCode: doc.data().languageCode || "",
        }));
        setVideos(videosData);
        if (videosData.length > 0) {
          setFeaturedVideo(videosData[0]);
        }
      } catch (error) {
        console.error(
          "Error fetching videos: ",
          (error as Error)?.message || "Unknown",
        );
      }
    };

    fetchVideos();
  }, [uid]);

  const handleFeaturedVideoChange = (
    video: VideoType,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setFeaturedVideo(video);
  };

  const deleteVideo = async (video: VideoType) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      if (video.filename && video.filename !== "no filename") {
        const filePath = `${uid}/botcasts/${video.filename}`;
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
      } else {
        const storageRef = ref(storage, video.downloadUrl);
        await deleteObject(storageRef);
      }

      await deleteDoc(doc(db, `users/${uid}/botcasts`, video.id));

      setVideos(videos.filter((v) => v.id !== video.id));

      // If the deleted video is the featured video, reset the featured video
      if (featuredVideo && featuredVideo.id === video.id) {
        setFeaturedVideo(null);
      }
    } catch (error) {
      console.error("Error deleting video: ", (error as Error).message);
    }
  };

  const clearFeaturedVideo = () => {
    setFeaturedVideo(null);
  };

  const downloadVideo = async (video: VideoType) => {
    try {
      const response = await fetch(video.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        video.filename && video.filename !== "no filename"
          ? video.filename
          : "botcasting_video.webm";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      console.error("Error downloading the video:", error);
    }
  };

  const handleCheckboxChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    video: VideoType,
  ) => {
    const { checked } = event.target;
    const videoRef = doc(db, `users/${uid}/botcasts`, video.id);
    await updateDoc(videoRef, {
      showOnProfile: checked,
    });
    // Optionally update local state if you are managing it
    setVideos(
      videos.map((v) =>
        v.id === video.id ? { ...v, showOnProfile: checked } : v,
      ),
    );
  };

  if (videos.length === 0)
    return (
      <div className="flex flex-col h-full justify-center items-center text-3xl">
        <div>No recordings found.</div>
      </div>
    );

  return (
    <div className="p-4">
      {featuredVideo && (
        <div className="flex flex-col mb-4">
          <div className="flex gap-2 flex-wrap text-xs">
            <div>
              Bot: {featuredVideo.botName || featuredVideo.botId || "No name"}
            </div>
            <div>
              Model:{" "}
              {featuredVideo.modelName || featuredVideo.modelId || "No model"}
            </div>
            <div>
              Language:{" "}
              {featuredVideo.language ||
                featuredVideo.languageCode ||
                "No language"}
            </div>
            <div>
              Created At: {featuredVideo.createdAt.toDate().toLocaleString()}
            </div>
            <div>Filename: {featuredVideo.filename || "No filename"}</div>
          </div>

          <video
            src={featuredVideo.downloadUrl}
            controls
            className="w-full border"
          />
          <div className="flex gap-2">
            <a
              className="text-white bg-blue-500 p-2 rounded-md w-max my-2"
              href={featuredVideo.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in new window
            </a>
            <button
              className="text-white bg-blue-500 p-2 rounded-md w-max my-2"
              onClick={clearFeaturedVideo}
            >
              Clear Featured
            </button>
            <button
              className="text-white bg-blue-500 p-2 rounded-md w-max my-2"
              onClick={() => downloadVideo(featuredVideo)}
            >
              Download
            </button>
            <button
              className="text-white bg-red-500 p-2 rounded-md w-max my-2"
              onClick={() => deleteVideo(featuredVideo)}
            >
              Delete
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div className="flex flex-col items-center" key={video.id}>
            <button
              onClick={(e) => handleFeaturedVideoChange(video, e)}
              aria-label="Set as Featured"
            >
              <video
                src={video.downloadUrl}
                className="w-full h-full rounded-md"
              />
            </button>
            <div className="flex flex-col w-full px-1">
              <div className="overflow-hidden truncate">{video.filename}</div>
              <div className="flex items-center justify-between w-full">
                <span className="truncate text-black">Show on profile</span>
                <input
                  type="checkbox"
                  checked={video.showOnProfile}
                  onChange={(e) => handleCheckboxChange(e, video)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
