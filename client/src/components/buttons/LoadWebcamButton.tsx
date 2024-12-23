import { toggleWebcam } from "@/utils/utils";
import { useGameStore } from "@/store";

const LoadWebcamButton = () => {
  // Button Styling - TEMPORARY STYLING BEGINS
  const testButtons = {
    padding: "0.25em 0.5em",
    margin: "0.25em",
    border: "3px solid #333",
    boxShadow: "0 0 0.5em #333",
    borderRadius: "0.5em",
    backgroundColor: "#069069",
    color: "#f8f8f8",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    height: "100%",
  };
  // END OF TEMPORARY STYLING
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
        style={testButtons}
        type="button"
        id="enable-webcam"
        name="enable-webcam"
        disabled={!canvasReady}
        onClick={handleWebcamToggle}
      >
        {!videoPlaying ? "WEBCAM 🎦" : "WEBCAM 🚫"}
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
