import { loadImageToCanvas } from "@/utils/model-utils";
import { useRef } from "react";
import { useGameStore } from "@/store";

const LoadImageButton = () => {
  // Button Styling - TEMPORARY STYLING BEGINS
  const testButtons = {
    padding: "0.25em 0.5em",
    margin: "0.25em",
    border: "3px solid #333",
    boxShadow: "0 0 0.5em #333",
    borderRadius: "0.25em",
    backgroundColor: "#10343D",
    color: "#f8f8f8",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    height: "100%",
  };
  // END OF TEMPORARY STYLING

  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const canvasReady = useGameStore((state) => state.canvasReady);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const currentMediaType = useGameStore((state) => state.currentMediaType);

  // loadImageToCanvas is a utility function in utils.ts using cv
  const handleLoadImage = async (file: File) => {
    try {
      // If video or webcam is enabled, stop it then load the image to the video element
      if (currentMediaType === "video" || currentMediaType === "webcam") {
        const videoElement = document.getElementById(
          "video-output"
        ) as HTMLVideoElement;
        const canvas = document.getElementById(
          "canvas-main"
        ) as HTMLCanvasElement;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Canvas context not found.");
        }
        setVideoPlaying(false);
        // Clear the canvas (should have same height and width as video/webcam)
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Remove src from video element
        videoElement.src = "";
      }

      await loadImageToCanvas(file);
      setCurrentMediaRef(file.name);
      setCurrentMediaType("image");
    } catch (error) {
      console.error("Failed to load image. Error: ", error);
      // Clear the current media reference and type
      setCurrentMediaType(null);
      setCurrentMediaRef(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Once the file is selected with ref to the file input, set the reference to the current image and load it
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentMediaRef(file.name);
      await handleLoadImage(file);
      setCurrentMediaType("image");
    }
  };

  return (
    <div className="btn btn-primary">
      {/* disabled when canvas is not ready=true */}
      <button
        style={testButtons}
        type="button"
        id="load-image"
        name="load-image"
        disabled={!canvasReady}
        onClick={handleButtonClick}
      >
        📂 IMAGE
      </button>
      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        id="image-file-input"
        name="image-file-input"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default LoadImageButton;
