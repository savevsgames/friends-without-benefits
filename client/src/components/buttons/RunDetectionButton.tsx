import { useGameStore } from "@/store";
import { runDetectionOnCurrentMedia } from "../../utils/custom-model-utils-2";
// import { runDetectionOnCurrentMedia } from "@/utils/ml5-model-utils"; // ml5 version

const RunDetectionButton = () => {
  const canvasReady = useGameStore((state) => state.canvasReady);
  const currentMediaType = useGameStore((state) => state.currentMediaType);
  const setGameSate = useGameStore((state) => state.setGameState);

  const handleDetection = () => {
    console.log(`Running Detection on ${currentMediaType}...`);
    if (currentMediaType) runDetectionOnCurrentMedia();
    setGameSate("playing");
  };

  return (
    <button
      onClick={handleDetection}
      disabled={!canvasReady || !currentMediaType}
      name="detect"
      id="detect"
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-teal-500 text-black text-lg font-bold shadow-md transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:bg-gray-400 disabled:cursor-not-allowed tracking-widest`}
    >
      Start Game
    </button>
  );
};
export default RunDetectionButton;
