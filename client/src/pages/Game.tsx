import { useEffect } from "react";
import Header from "@/components/Header.tsx";
import { ControlPanel } from "../components/ControlPanel.tsx";
import Canvas from "../components/Canvas.tsx";
import { Dashboard } from "../components/Dashboard.tsx";

import { useGameStore } from "@/store";
// import LoadImageButton from "../components/buttons/LoadImageButton.tsx";
// import RunDetectionButton from "@/components/buttons/RunDetectionButton.tsx";
// import LoadVideoButton from "../components/buttons/LoadVideoButton.tsx";
// import LoadWebcamButton from "@/components/buttons/LoadWebcamButton.tsx";
// import PlayStopVideoButton from "@/components/buttons/PlayStopVideoButton.tsx";
// import PauseVideoButton from "@/components/buttons/PauseVideoButton.tsx";

function Game() {
  // when canvasReady is changed in the store, setCanvasReady is called and the model is loaded
  const setCanvasReady = useGameStore((state) => state.setCanvasReady);

  useEffect(() => {
    const initializeModel = async () => {
      console.log("Loading TensorFlow.js COCO-SSD Model...");
      try {
        const cocoSsd = await window.cocoSsd?.load();
        if (cocoSsd) {
          window.cocoSsd = cocoSsd;
          console.log("COCO-SSD Model successfully loaded!");
        } else {
          console.error("COCO-SSD Model failed to load.");
        }
      } catch (error) {
        console.error("Error loading TensorFlow model:", error);
      }
    };

    initializeModel();
  }, [setCanvasReady]);

  return (
    <>
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 h-screen overflow-auto bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100 dark:bg-gradient-to-r dark:from-neutral-950 dark:via-teal-900 dark:to-neutral-950">
        {/* Control Panel and Dashboard */}
        <div className="col-span-1 md:col-span-1 grid grid-rows-4 gap-2 p-2">
          {/* Control Panel */}
          <div className="row-span-1 bg-slate-50 dark:bg-teal-900 border border-teal-800 dark:border-teal-800 shadow-md rounded-lg">
            <ControlPanel />
          </div>
          {/* Dashboard */}
          <div className="row-span-3 bg-slate-100 dark:bg-teal-800 border border-teal-700 dark:border-teal-700 shadow-sm rounded-lg">
            <Dashboard />
          </div>
        </div>

        {/* Canvas Section */}
        <div className="col-span-1 md:col-span-2 m-2 bg-slate-200 dark:bg-teal-900 border border-teal-800 dark:border-teal-800 shadow-md rounded-lg">
          <Canvas />
        </div>
      </div>
    </>
  );
}

export default Game;
