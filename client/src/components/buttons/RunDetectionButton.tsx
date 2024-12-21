import { useGameStore } from "@/store";
import { runDetection } from "@/utils/utils";

const RunDetectionButton = () => {
  const canvasReady = useGameStore((state) => state.canvasReady);
  const currentMediaType = useGameStore((state) => state.currentMediaType);

  const handleDetection = () => {
    console.log(`Running Detection on ${currentMediaType}...`);
    if (currentMediaType) runDetection(currentMediaType);
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
