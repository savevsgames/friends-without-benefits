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
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-gray-100 text-xs text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200  pointer-events-auto text-center font-semibold"
        id="enable-webcam"
        name="enable-webcam"
        disabled={!canvasReady}
        onClick={handleWebcamToggle}
      >
        {!videoPlaying ? "Click to get you prepped! 🎦" : "Quit Game 🚫"}
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
