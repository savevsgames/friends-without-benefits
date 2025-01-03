import { useGameStore } from "@/store";
import { toggleWebcam } from "@/utils/model-utils";
import { runDetectionOnCurrentMedia } from "../../utils/custom-model-utils-2";
import ReactModal from "react-modal";

// this is a combo between the LoadWebcamButton and RunDetectionButton

const StartGameButton = () => {
  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const canvasReady = useGameStore((state) => state.canvasReady);
  //   const currentMediaType = useGameStore((state) => state.currentMediaType);

  const handleLoadCameraAndStartGame = async () => {
    console.log("Loading webcam...");
    const webcamOn = await toggleWebcam(true);

    if (webcamOn) {
      setCurrentMediaType("webcam");
      setCurrentMediaRef("webcam-stream");
      setVideoPlaying(true);
      console.log("Webcam is enabled. Running detection...");
      //   if (currentMediaType) {
      //     runDetectionOnCurrentMedia();
      //   }
      runDetectionOnCurrentMedia(); // starts detection right after the webcom is confirmed on
    } else {
      console.error("Failed to load webcam stream.");
      <ReactModal>Failed to Load your camera! 💔</ReactModal>;
      setCurrentMediaType(null);
      setCurrentMediaRef(null);
      setVideoPlaying(false);
    }
  };

  return (
    <button
      onClick={handleLoadCameraAndStartGame}
      disabled={!canvasReady}
      name="load-and-start"
      id="load-and-start"
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-100 text-xs text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200 w-48 pointer-events-auto"
    >
      Start Game
    </button>
  );
};

export default StartGameButton;
