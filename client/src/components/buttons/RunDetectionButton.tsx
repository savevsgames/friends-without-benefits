import { useGameStore } from "@/store";
import { runDetectionOnCurrentMedia } from "../../utils/custom-model-utils-2";
// import { runDetectionOnCurrentMedia } from "@/utils/ml5-model-utils"; // ml5 version

const RunDetectionButton = () => {

  const canvasReady = useGameStore((state) => state.canvasReady);
  const currentMediaType = useGameStore((state) => state.currentMediaType);

  const handleDetection = () => {
    console.log(`Running Detection on ${currentMediaType}...`);
    if (currentMediaType) runDetectionOnCurrentMedia();
  };

  return (
    <button
      onClick={handleDetection}
      disabled={!canvasReady}
      name="detect"
      id="detect"
      className="bg-teal-50 dark:bg-teal-800 text-teal-900 dark:text-gray-200 font-bold tracking-wide rounded-lg shadow-lg border border-teal-800 dark:border-teal-400 border-l-4 border-l-teal-800 dark:border-l-teal-400 px-2 py-1 sm:px-3 sm:py-2 md:px-3 md:py-2 text-xs sm:text-sm md:text-xs hover:bg-teal-100 dark:hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-full"
    >
      🎭START GAME!🎭
    </button>
  );
};
export default RunDetectionButton;
