import { useGameStore } from "@/store";

const PlayStopVideoButton = () => {
  const canvasReady = useGameStore((state) => state.canvasReady);
  const videoPlaying = useGameStore((state) => state.videoPlaying);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );

  const handleButtonClick = () => {
    try {
      const videoElement = document.getElementById(
        "video-element"
      ) as HTMLVideoElement;
      if (!videoElement) {
        throw new Error("Video element not found.");
      }

      // If video is stopped or ended, play it
      if (videoElement.paused || videoElement.ended) {
        videoElement.play();
      } else {
        videoElement.pause();
      }

      setVideoPlaying(!videoPlaying);
      if (videoPlaying) {
        setCurrentMediaType("video");
        setCurrentMediaRef("video-element");
      } else {
        setCurrentMediaType(null);
        setCurrentMediaRef(null);
      }
    } catch (error) {
      console.error("Failed to play video. Error: ", error);
      setCurrentMediaType(null);
      setCurrentMediaRef(null);
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
