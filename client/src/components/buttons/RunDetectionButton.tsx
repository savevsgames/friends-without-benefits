import { useGameStore } from "@/store";
import { runDetectionOnCurrentMedia } from "../../utils/custom-model-utils-2";
// import { runDetectionOnCurrentMedia } from "@/utils/ml5-model-utils"; // ml5 version
import { Tooltip } from "react-tooltip";

const RunDetectionButton = () => {
  const canvasReady = useGameStore((state) => state.canvasReady);
  const currentMediaType = useGameStore((state) => state.currentMediaType);
  // const setGameSate = useGameStore((state) => state.setGameState);

  const handleDetection = () => {
    console.log(`Running Detection on ${currentMediaType}...`);
    if (currentMediaType) runDetectionOnCurrentMedia();
    // Removed setting game state once detection turns on.
    // Abstacting start game and start detection logic
  };

  return (
    <>
      <button
        onClick={handleDetection}
        disabled={!canvasReady || !currentMediaType}
        data-tooltip-id="start game"
        name="detect"
        id="detect"
        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-teal-600 to-teal-900 text-white text-lg font-semibold shadow-lg transition-transform transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-400 disabled:bg-gray-400 disabled:text-gray-300 disabled:cursor-not-allowed tracking-wide`}
      >
        Start Game
        <Tooltip
          id="start game"
          place="bottom"
          className="font-thin text-xs bg-gray-400"
          style={{ fontSize: "10px" }}
        >
          {!canvasReady || !currentMediaType
            ? "Turn on camera from the 'Game Control' panel ⬅️"
            : undefined}
        </Tooltip>
      </button>
      {/* <Tooltip place="top" /> */}
    </>
  );
};
export default RunDetectionButton;
