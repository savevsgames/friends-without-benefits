import { useGameStore } from "@/store";
import { runDetectionOnCurrentMedia } from "../../utils/custom-model-utils-2";
// import { runDetectionOnCurrentMedia } from "@/utils/ml5-model-utils"; // ml5 version

const RunDetectionButton = () => {

  const canvasReady = useGameStore((state) => state.canvasReady);
  const currentMediaType = useGameStore((state) => state.currentMediaType);
  const setGameSate = useGameStore((state) => state.setGameState)

  const handleDetection = () => {
    console.log(`Running Detection on ${currentMediaType}...`);
    if (currentMediaType) runDetectionOnCurrentMedia();
    setGameSate("playing");
  };

  return (
    <button
      onClick={handleDetection}
      disabled={!canvasReady}
      name="detect"
      id="detect"
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-gray-100 text-xs text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200  pointer-events-auto text-center font-semibold"
    >
      🎭Start Game!🎭
    </button>
  );
};
export default RunDetectionButton;
