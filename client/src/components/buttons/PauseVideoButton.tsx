import { useGameStore } from "@/store";
import { pauseMedia, stopMedia } from "@/utils/model-utils";

const PauseVideoButton = () => {
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
  const canvasReady = useGameStore((state) => state.canvasReady);
  const videoPlaying = useGameStore((state) => state.videoPlaying);

  const handleButtonClick = () => {
    try {
      const videoElement = document.getElementById(
        "video-output"
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
      className="bg-teal-50 dark:bg-teal-800 text-teal-900 dark:text-gray-200 font-bold tracking-wide rounded-lg shadow-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base 
hover:bg-teal-100 dark:hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-full"
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
