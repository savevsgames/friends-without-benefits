import { useEffect, useRef } from "react";
import { useGameStore } from "../store"; // Import Zustand store

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
    <div id="canvas-container" className="relative w-auto h-auto m-0">
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
    </div>
  );
};

export default Canvas;
