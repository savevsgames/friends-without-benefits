import { useEffect } from "react";
import Header from "@/components/Header.tsx";

import Canvas from "../components/Canvas.tsx";

import { useGameStore } from "@/store";
import MultiplayerInitializer from "@/components/MulitplayerInitializer.ts";
import { loadModel } from "@/utils/ml5-model-utils.ts";
import SideBar from "@/components/SideBar.tsx";

function Game() {
  // when canvasReady is changed in the store, setCanvasReady is called and the model is loaded
  const setCanvasReady = useGameStore((state) => state.setCanvasReady);

  const loadMl5Model = async () => {
    console.log("Loading ml5 model...");
    try {
      await loadModel();
    } catch (error) {
      console.error("Error loading ml5 model:", error);
    }
  };

  useEffect(() => {
    // if ml5 is already there, just load the model
    if (window.ml5) {
      loadMl5Model();
      return;
    }

    // otherwise, poll every 100ms
    const interval = setInterval(() => {
      if (window.ml5) {
        clearInterval(interval);
        loadMl5Model();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [setCanvasReady]);

  // useEffect(() => {
  // const initializeModel = async () => {
  //   console.log("Loading TensorFlow.js COCO-SSD Model...");
  //   try {
  //     const cocoSsd = await window.cocoSsd?.load();
  //     if (cocoSsd) {
  //       window.cocoSsd = cocoSsd;
  //       console.log("COCO-SSD Model successfully loaded!");
  //     } else {
  //       console.error("COCO-SSD Model failed to load.");
  //     }
  //   } catch (error) {
  //     console.error("Error loading TensorFlow model:", error);
  //   }
  // };
  // initializeModel();
  // }, [setCanvasReady]);

  return (
    <>
      {/* Multiplayer initializer has no dimensions - used to initialize socket-io and peerjs with server */}
      <MultiplayerInitializer />
      <div className="grid grid-cols-[auto,1fr] h-screen overflow-auto bg-zinc-50 dark:bg-gradient-to-r dark:from-black dark:via-neutral-950 dark:to-teal-950">
        {/* Sidebar */}
        <div className="h-full flex-none">
          <SideBar />
        </div>

        {/* Main content area */}
        <div className="flex flex-col w-full h-full">
          <Header />

          {/* Canvas Section */}
          <div className="flex-1 m-2 bg-zinc-50 dark:bg-teal-950 border border-neutral-950 dark:border-teal-800 shadow-md">
            <Canvas />
          </div>
        </div>
      </div>
    </>
  );
}

export default Game;
