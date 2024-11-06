import React from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import { Download } from "lucide-react"; // Import the Lucide Download icon
import ReactDOMServer from "react-dom/server";
import { v4 } from "uuid";

interface VideoPlayerProps {
  options: typeof videojs.options;
  onReady?: (player: Player) => void;
}

function createLucideSvg(Component: React.ElementType) {
  const svgString = ReactDOMServer.renderToString(<Component size={16} />);
  const svgElement = document.createElement("span");
  svgElement.innerHTML = svgString;
  return svgElement;
}

const Button = videojs.getComponent("Button");

class CustomButton extends Button {
  constructor(player: Player, options?: Record<string, unknown>) {
    super(player, options);
    const videoUrl = this.player().currentSrc();
    if (videoUrl) {
      const downloadIcon = createLucideSvg(Download);
      downloadIcon.classList.add("vjs-download-icon"); // Optional: add a class for styling
      this.el().appendChild(downloadIcon);
    }
  }

  handleClick(): void {
    const videoUrl = this.player().currentSrc(); // Get the video source URL
    // Create an anchor element to trigger the download
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${v4()}.mp4`; // Set a default filename for download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up the element
    console.log("Download button clicked!");
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const videoRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<Player | null>(null);
  const { options, onReady } = props;

  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current?.appendChild(videoElement);
      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady?.(player);
        videojs.registerComponent("CustomButton", CustomButton);
        player.getChild("ControlBar")?.addChild("CustomButton", {});
      }));
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef, onReady]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoPlayer;
