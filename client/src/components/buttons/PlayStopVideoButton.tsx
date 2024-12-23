import { useGameStore } from "@/store";
import { playMedia, stopMedia } from "@/utils/utils";

const PlayStopVideoButton = () => {
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

      // If video is stopped or ended, play it
      // TODO: Game Logic for ending game if video/stream ends > game ends
      if (videoElement.paused || videoElement.ended) {
        playMedia();
      } else {
        stopMedia();
      }
    } catch (error) {
      console.error("Failed to play/stop video. Error: ", error);
      stopMedia();
    }
  };

  return (
    <button
      style={testButtons}
      type="button"
      id="play-button"
      name="play-button"
      disabled={!canvasReady}
      onClick={handleButtonClick}
    >
      {videoPlaying ? "⏹ STOP" : "▶ PLAY"}
    </button>
  );
};
export default PlayStopVideoButton;
