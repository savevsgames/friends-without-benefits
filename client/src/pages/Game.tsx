import { useEffect, useState } from "react";
import Header from "@/components/Header.tsx";
import Canvas from "../components/Canvas.tsx";
import Footer from "@/components/Footer.tsx";

import { useGameStore } from "@/store";
import MultiplayerInitializer from "@/components/MulitplayerInitializer.ts";
// import { loadModel } from "@/utils/custom-model-utils-2.ts";
import SideBar from "@/components/SideBar.tsx";
import { useModel } from "@/hooks/useModelStore.ts";
import GameOptionsModal from "@/components/GameOptionsModal.tsx";


function Game() {

  // for the modal, have the initial state as true to open on load.
  const [isModalOpen, setIsModalOpen] = useState(true);


  // const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
      <GameOptionsModal isOpen={isModalOpen} onClose={closeModal} />;
      <Footer />
    </>
  );
}

export default Game;
