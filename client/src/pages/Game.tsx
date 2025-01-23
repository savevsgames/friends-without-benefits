import { useEffect, useState } from "react";
// import Header from "@/components/Header.tsx";
import Canvas from "../components/Canvas.tsx";
import Footer from "@/components/Footer.tsx";

import { useGameStore } from "@/store";
import MultiplayerInitializer from "@/components/MulitplayerInitializer.ts";
// import { loadModel } from "@/utils/custom-model-utils-2.ts";
import SideBar from "@/components/SideBar.tsx";
import { useModel } from "@/hooks/useModelStore.ts";
import GameOptionsModal from "@/components/GameOptionsModal.tsx";
import GameCompleteModal from "@/components/GameCompleteModal.tsx";

function Game() {
  // for the modal, have the initial state as true to open on load.
  const [isGameOptionsModalOpen, setIsGameOptionsModalOpen] = useState(true);
  const [isGameCompleteModalOpen, setIsGameCompleteModalOpen] = useState(false); // Initially open

  // const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsGameOptionsModalOpen(false);

  // We store the model as a global or module-level variable
  const { isLoading, model } = useModel(); // removed error - might be causing refreshes needlessly
  // when canvasReady is changed in the store, setCanvasReady is called and the model is loaded
  // const setCanvasReady = useGameStore((state) => state.setCanvasReady);

  const handleGameCompleteClose = () => {
    setIsGameCompleteModalOpen(false);
    useGameStore.getState().gameState = "setup";
    setIsGameOptionsModalOpen(true);
  };

  useEffect(() => {
    // Make sure the model is loaded and there are no errors in the loading process
    try {
      if (model && !isLoading) {
        // setCanvasReady(true);
        console.log(
          "Active Detection Loop: ",
          useGameStore.getState().activeDetectionLoop
        );
      }
    } catch (error) {
      console.log("Error loading model.", error);
    }
  }, [model, isLoading]);

  useEffect(() => {
    // When the game state changes to "complete", open the modal
    const gameState = useGameStore.getState().gameState;
    if (gameState === "complete") {
      setIsGameCompleteModalOpen(true);
    }
  }, []);

  if (isLoading) {
    return <div>Loading model...</div>;
  }

  return (
    <>
      {/* Multiplayer initializer has no dimensions - used to initialize socket-io and peerjs with server */}
      <MultiplayerInitializer />
      <div className="grid grid-cols-[auto,1fr] h-screen w-full overflow-auto bg-zinc-50 dark:bg-teal-950">
        {/* Sidebar */}
        <div className="h-full flex-none">
          <SideBar />
        </div>

        {/* Main content area */}
        <div className="flex flex-col w-full h-full">
          {/* <Header /> */}

          {/* Canvas Section */}
          <div className="flex-1 bg-zinc-50 dark:bg-teal-950  dark:border-teal-800 shadow-md h-full w-full">
            <Canvas />
          </div>
          {/* <GameStoreLiveFeed /> */}
        </div>
      </div>
      <GameOptionsModal isOpen={isGameOptionsModalOpen} onClose={closeModal} />;
      <GameCompleteModal
        isOpen={isGameCompleteModalOpen}
        onClose={() => handleGameCompleteClose()}
      />
      <Footer />
    </>
  );
}

export default Game;
