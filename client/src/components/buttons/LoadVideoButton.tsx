import { loadVideoToVideoOutput } from "@/utils/utils";
import { useRef } from "react";
import { useGameStore } from "@/store";

const LoadVideoButton = () => {
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
  const videoPlaying = useGameStore((state) => state.videoPlaying);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LoadVideoToCanvas is a utility function in utils.ts using cv
  const handleLoadVideo = async (file: File) => {
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
        style={testButtons}
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
