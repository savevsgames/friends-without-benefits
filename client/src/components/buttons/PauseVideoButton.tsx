import { useGameStore } from "@/store";
import { pauseMedia, stopMedia } from "@/utils/utils";

const PauseVideoButton = () => {
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
      if (!videoElement.paused) {
        pauseMedia();
      } else if (!videoPlaying) {
        console.log("Video is already paused or ended.");
      }
    } catch (error) {
      console.error("Failed to pause video. Error: ", error);
      stopMedia();
    }
  };

  return (
    <button
      className="btn btn-primary"
      type="button"
      id="pause-button"
      name="pause-button"
      disabled={!canvasReady}
      onClick={handleButtonClick}
    >
      Load Image
    </button>
  );
};
export default PauseVideoButton;
