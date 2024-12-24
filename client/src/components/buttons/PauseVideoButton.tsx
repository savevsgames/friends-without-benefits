import { useGameStore } from "@/store";
import { pauseMedia, stopMedia } from "@/utils/utils";

const PauseVideoButton = () => {
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
  const canvasReady = useGameStore((state) => state.canvasReady);
  const videoPlaying = useGameStore((state) => state.videoPlaying);

  const handleButtonClick = () => {
    try {
      const videoElement = document.getElementById(
        "video-element"
      ) as HTMLVideoElement;
      if (!videoElement) {
        throw new Error("Video element not found.");
      }

      // If video is playing, pause it
      if (!videoElement.paused && !videoElement.ended) {
        pauseMedia();
      } else {
        console.log("Video is already paused or ended. Stopping video...");
        stopMedia();
      }
    } catch (error) {
      console.error("Failed to pause video. Error: ", error);
      stopMedia();
    }
  };

  return (
    <button
      style={testButtons}
      type="button"
      id="pause-button"
      name="pause-button"
      disabled={!canvasReady}
      onClick={handleButtonClick}
    >
      {videoPlaying ? "⏸ PAUSE" : "🤚 PAUSED"}
    </button>
  );
};
export default PauseVideoButton;
