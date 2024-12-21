import { useGameStore } from "@/store";
import { runDetection } from "@/utils/utils";

const RunDetectionButton = () => {
  const canvasReady = useGameStore((state) => state.canvasReady);

  const handleDetection = () => {
    console.log("Running Detection...");
    runDetection();
  };

  return (
    <button
      onClick={handleDetection}
      disabled={!canvasReady}
      name="detect"
      id="detect"
      className="btn btn-primary"
    >
      FIND OBJECTS!
    </button>
  );
};
export default RunDetectionButton;
