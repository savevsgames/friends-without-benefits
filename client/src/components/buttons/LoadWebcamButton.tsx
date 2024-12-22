import { enableWebcam } from "@/utils/utils";
import { useGameStore } from "@/store";

const LoadWebcamButton = () => {
  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const canvasReady = useGameStore((state) => state.canvasReady);

  /***
   * On button click -> enables webcam if stream is available
   */
  const handleEnableWebcam = async () => {
    // Utility function sets webcam to canvas-main
    const stream = await enableWebcam();
    // If a stream is achieved we can update the store
    if (stream) {
      setCurrentMediaType("webcam");
      setCurrentMediaRef("webcam-stream");
      setVideoPlaying(true);
      console.log("Webcam is enabled and the context has been updated.");
    } else {
      console.error("Failed to load webcam stream.");
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary"
        type="button"
        id="enable-webcam"
        name="enable-webcam"
        disabled={!canvasReady}
        onClick={handleEnableWebcam}
      >
        Enable Webcam
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
