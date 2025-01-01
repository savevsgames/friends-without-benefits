import { useEffect } from "react";
import Header from "@/components/Header.tsx";
import Canvas from "../components/Canvas.tsx";

import { useGameStore } from "@/store";
import MultiplayerInitializer from "@/components/MulitplayerInitializer.ts";
// import { loadModel } from "@/utils/custom-model-utils-2.ts";
import SideBar from "@/components/SideBar.tsx";
import { useModel } from "@/components/ModelProvider.tsx";

function Game() {
  // We store the model as a global or module-level variable

  const { isLoading, error, model } = useModel();
  // when canvasReady is changed in the store, setCanvasReady is called and the model is loaded
  const setCanvasReady = useGameStore((state) => state.setCanvasReady);

  useEffect(() => {
    // Make sure the model is loaded and there are no errors in the loading process
    if (model && !isLoading && !error) {
      setCanvasReady(true);
      console.log(
        "Active Detection Loop: ",
        useGameStore.getState().activeDetectionLoop
      );
    }
  }, [model, isLoading, error, setCanvasReady]);

  if (isLoading) {
    return <div>Loading model...</div>;
  }

  if (error) {
    return <div>Error loading model: {error.message}</div>;
  }

  return (
    <>
      {/* Multiplayer initializer has no dimensions - used to initialize socket-io and peerjs with server */}
      <MultiplayerInitializer />
      <div className="grid grid-cols-[auto,1fr] h-screen overflow-auto bg-zinc-50 dark:bg-teal-950">
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
