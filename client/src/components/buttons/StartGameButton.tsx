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
      <ReactModal>
        Failed to Load your camera! 💔
      </ReactModal>
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
      className="bg-teal-50 dark:bg-teal-800 text-teal-900 dark:text-gray-200 font-bold tracking-wide rounded-lg shadow-lg border border-teal-800 dark:border-teal-400 border-l-4 border-l-teal-800 dark:border-l-teal-400 px-2 py-1 sm:px-3 sm:py-2 md:px-3 md:py-2 text-xs sm:text-sm md:text-xs hover:bg-teal-100 dark:hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-full"
    >
      Start Game
    </button>
  );
};

export default StartGameButton;
