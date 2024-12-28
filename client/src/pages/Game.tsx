import { useEffect } from "react";
import Header from "@/components/Header.tsx";
import { ControlPanel } from "../components/ControlPanel.tsx";
import Canvas from "../components/Canvas.tsx";
import { Dashboard } from "../components/Dashboard.tsx";

import { useGameStore } from "@/store";
import LoadImageButton from "../components/buttons/LoadImageButton.tsx";
import RunDetectionButton from "@/components/buttons/RunDetectionButton.tsx";
import LoadVideoButton from "@/components/buttons/LoadVideoButton.tsx";
import LoadWebcamButton from "@/components/buttons/LoadWebcamButton.tsx";
import PlayStopVideoButton from "@/components/buttons/PlayStopVideoButton.tsx";
import PauseVideoButton from "@/components/buttons/PauseVideoButton.tsx";
import MultiplayerConnectionManager from "@/components/MultiplayerConnectionManager.tsx";

function Game() {
  // when canvasReady is changed in the store, setCanvasReady is called and the model is loaded
  const setCanvasReady = useGameStore((state) => state.setCanvasReady);
  useEffect(() => {
    const initializeModel = async () => {
      // TODO: In the future we can add logic to switch between models here
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
      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 h-screen overflow-auto bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100">
        <div className="col-span-1 md:col-span-1 grid grid-rows-4 gap-1 p-1">
          {/* Control Panel */}
          <div className="row-span-2 bg-slate-100 p-4 border border-teal-900 rounded">
            <div className="grid grid-cols-2 gap-2 grid-rows-3">
              <LoadImageButton />
              <LoadVideoButton />
              <PlayStopVideoButton />
              <PauseVideoButton />
              <LoadWebcamButton />
              <RunDetectionButton />
            </div>
            <div>
              <MultiplayerConnectionManager />
            </div>
            <ControlPanel />
          </div>
          {/* Dashboard Section */}
          <div className="row-span-2 bg-slate-200 p-4 border border-teal-900 rounded">
            <Dashboard />
          </div>
        </div>
        {/* Canvas Section */}
        <div className="col-span-1 md:col-span-2 m-1 bg-slate-50 border border-teal-900 rounded">
          <Canvas />
        </div>
      </div>
    </>
  );
}
export default Game;
