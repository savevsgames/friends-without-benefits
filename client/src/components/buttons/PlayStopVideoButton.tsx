import { useGameStore } from "@/store";
import { playMedia, stopMedia } from "@/utils/utils";

const PlayStopVideoButton = () => {
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
      className="btn btn-primary"
      type="button"
      id="play-button"
      name="play-button"
      disabled={!canvasReady}
      onClick={handleButtonClick}
    >
      {videoPlaying ? "Stop Video" : "Play Video"}
    </button>
  );
};
export default PlayStopVideoButton;