import { useEffect, useRef } from "react";
import { useGameStore } from "../store"; // Import Zustand store
// import MultiplayerChat from "./MultiplayerChat";
// import MultiplayerVideoFeed from "./MultiplayerVideoFeed";
// import GameStoreLiveFeed from "./GameStoreLiveFeed";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, videoPlaying } = useGameStore(); // Access Zustand state

  // Canvas clearing interval for bounding boxes for video only
  useEffect(() => {
    if (videoPlaying) {
      const intervalId = setInterval(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (context && canvas) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      }, 2000); // Clear every 2 seconds

      return () => clearInterval(intervalId);
    }
  }, [videoPlaying]);

  // Log the current game state when it changes - setup, playing, gameover
  useEffect(() => {
    if (gameState === "setup") {
      console.log("Game State is Setup");
    } else if (gameState === "playing") {
      console.log("Game State is Playing");
    } else if (gameState === "gameover") {
      console.log("Game State is Game Over");
    } else {
      console.log("Game State is Unknown");
    }
  }, [gameState]);

  // Set Canvas Ready state with setCanvasReady once OpenCV.js is initialized
  const setCanvasReady = useGameStore((state) => state.setCanvasReady);

  useEffect(() => {
    const cv = window.cv;
    console.log("CV: ", cv);

    const loadOpenCV = async () => {
      console.log("Waiting for OpenCV.js to be defined...");

      // Step 1: Wait for `cv` to be defined in the global scope
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (typeof cv !== "undefined") {
            clearInterval(interval);
            resolve();
          }
        }, 100); // Check every 100ms
      });

      console.log("OpenCV.js is defined. Initializing...");

      // Step 2: Wait for `cv.onRuntimeInitialized` to be defined

      await new Promise<void>((resolve) => {
        const cvModule = window.cv || window.Module; // Support both cv and Module contexts
        if (cvModule?.calledRun) {
          // If the runtime is already initialized
          resolve();
        } else {
          const oldOnRuntimeInitialized = cvModule.onRuntimeInitialized;
          cvModule.onRuntimeInitialized = () => {
            if (oldOnRuntimeInitialized) oldOnRuntimeInitialized();
            resolve();
          };
        }
      });
      console.log("OpenCV.js is initialized!");

      // Step 3: Perform canvas initialization or other setup tasks
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.globalAlpha = 0.7; // Set transparency to 70%

          context.fillStyle = "black";
          context.font = "20px Arial";
          context.fillText("SCAVENGER HUNT 2025", 10, 30);
          context.globalAlpha = 1; // Reset transparency
        }
      }

      // Update Zustand state to indicate the canvas is ready
      setCanvasReady(true);
      console.log("Game State: ");
    };

    loadOpenCV();
  }, [setCanvasReady]);

  // Return the canvas component when currentMediaRef changes and type is set to an image or video

  return (
    <div
      id="game-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <div
        id="canvas-container"
        className="relative w-full"
        style={{ overflow: "hidden", maxHeight: "calc(100vh - 400px)" }}
      >
        <canvas
          id="canvas-main"
          ref={canvasRef}
          style={{
            display: "block",
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "auto",
            zIndex: 10,
          }}
        ></canvas>
        <video
          id="video-output"
          style={{
            display: "block",
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "auto",
            zIndex: 2,
          }}
          playsInline
          muted
          crossOrigin="anonymous"
        ></video>
        <img
          id="image-output"
          style={{
            display: "block",
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "auto",
            zIndex: 1,
          }}
          crossOrigin="anonymous"
        />
        <div
          id="debug-overlay"
          style={{
            display: "block",
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "auto",
            zIndex: 100,
          }}
        >
          {/* <GameStoreLiveFeed /> */}
        </div>
      </div>
      {/* New Div Below Canvas */}
      <div
        className="relative z-20 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md rounded-lg"
        style={{
          marginTop: "10px",
        }}
      >
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 my-2 underline-offset-4 underline">
          This is an option for the multiplayer video/chat area.
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            border: "1px solid black",
          }}
        >
          <div className="border-2 border-black background-teal-200 dark:bg-teal-950">
            {/* <MultiplayerVideoFeed /> */}
          </div>
          {/* <MultiplayerChat /> */}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
