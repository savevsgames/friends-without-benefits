import { toggleWebcam } from "@/utils/model-utils";
import { useGameStore } from "@/store";

const LoadWebcamButton = () => {

  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const canvasReady = useGameStore((state) => state.canvasReady);
  const videoPlaying = useGameStore((state) => state.videoPlaying);

  /***
   * On button click -> enables webcam if stream is available
   */
  const handleWebcamToggle = async () => {
    // webcamOn will be true if the webcam becomes available
    const webcamOn = await toggleWebcam(!videoPlaying);

    if (webcamOn) {
      setCurrentMediaType("webcam");
      setCurrentMediaRef("webcam-stream");
      setVideoPlaying(true);
      console.log("Webcam is enabled and the context has been updated.");
    } else {
      console.error("Failed to load webcam stream.");
      setCurrentMediaType(null);
      setCurrentMediaRef(null);
      setVideoPlaying(false);
    }
  };

  return (
    <div>
      <button
        className="bg-teal-50 dark:bg-teal-800 text-teal-900 dark:text-gray-200 font-bold tracking-wide rounded-lg shadow-lg border border-teal-800 dark:border-teal-400 border-l-4 border-l-teal-800 dark:border-l-teal-400 px-2 py-1 sm:px-3 sm:py-2 md:px-3 md:py-2 text-xs sm:text-sm md:text-xs hover:bg-teal-100 dark:hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-full"
        id="enable-webcam"
        name="enable-webcam"
        disabled={!canvasReady}
        onClick={handleWebcamToggle}
      >
        {!videoPlaying ? "WEBCAM ON 🎦" : "WEBCAM OFF 🚫"}
      </button>
      {/* Hidden video element for capturing webcam stream */}
      <video
        id="webcam-video"
        autoPlay
        playsInline
        style={{ display: "none" }}
      />
    </div>
  );
};
export default LoadWebcamButton;
