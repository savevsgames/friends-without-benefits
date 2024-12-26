import { loadVideoToVideoOutput } from "@/utils/model-utils";
import { useRef } from "react";
import { useGameStore } from "@/store";

const LoadVideoButton = () => {
  // Button Styling - TEMPORARY STYLING BEGINS
  // const testButtons = {
  //   padding: "0.25em 0.5em",
  //   margin: "0.25em",
  //   border: "3px solid #333",
  //   boxShadow: "0 0 0.5em #333",
  //   borderRadius: "0.25em",
  //   backgroundColor: "#10343D",
  //   color: "#f8f8f8",
  //   textDecoration: "none",
  //   fontWeight: "bold",
  //   cursor: "pointer",
  //   width: "100%",
  //   height: "100%",
  // };
  // END OF TEMPORARY STYLING
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const canvasReady = useGameStore((state) => state.canvasReady);
  const videoPlaying = useGameStore((state) => state.videoPlaying);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentMediaType = useGameStore((state) => state.currentMediaType);

  // LoadVideoToCanvas is a utility function in utils.ts using cv
  const handleLoadVideo = async (file: File) => {
    // If video or webcam is enabled, stop it then load the image to the video element
    if (currentMediaType === "image") {
      const imageElement = document.getElementById(
        "image-output"
      ) as HTMLImageElement;
      const canvas = document.getElementById(
        "canvas-main"
      ) as HTMLCanvasElement;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas context not found.");
      }
      // Clear the canvas (should have same height and width as video/webcam)
      context.clearRect(0, 0, imageElement.width, imageElement.height);
      // Remove src from image element
      imageElement.src = "";
    }
    await loadVideoToVideoOutput(file);
  };

  const handleButtonClick = () => {
    if (videoPlaying) {
      setVideoPlaying(false);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoPlaying(true);
      setCurrentMediaRef(file.name);
      await handleLoadVideo(file);
      setCurrentMediaType("video");
    }
  };

  return (
    <div className="btn btn-primary">
      <button
        className="bg-teal-50 dark:bg-teal-800 text-teal-900 dark:text-gray-200 font-bold tracking-wide rounded-lg shadow-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base 
hover:bg-teal-100 dark:hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-full"
        type="button"
        id="load-video"
        name="load-video"
        disabled={!canvasReady}
        onClick={handleButtonClick}
      >
        📂 VIDEO
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        id="video-file-input"
        name="video-file-input"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};
export default LoadVideoButton;
