import { toggleWebcam } from "@/utils/model-utils";
import { useGameStore } from "@/store";

const LoadWebcamButton = ({ variant, onComplete}: {variant: "tuto" | "sidebar", onComplete? : () => void}) => {

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

    if (onComplete) onComplete();
  };

const variantStyles = {
  tuto: "px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700",
  sidebar: ""
}

  return (
    <div>
      <button

        className= {`${variantStyles[variant]}`}
        id="enable-webcam"
        name="enable-webcam"
        disabled={!canvasReady}
        onClick={handleWebcamToggle}
      >
        {!videoPlaying ? "Webcam On" : "Webcam Off"}
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
