import { useEffect, useRef } from "react";
import { useGameStore } from "../store"; // Import Zustand store

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Access Zustand state
  const gameState = useGameStore((state) => state.gameState);
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

      // Retry logic with a 100ms timeout and escape after 2 minutes
      // const maxRetries = 1200; // 2 minutes @ 100ms each
      // let retries = 0;

      // await new Promise<void>((resolve, reject) => {
      //   const interval = setInterval(() => {
      //     if (cv && cv["onRuntimeInitialized"]) {
      //       clearInterval(interval);
      //       resolve();
      //     } else if (retries >= maxRetries) {
      //       clearInterval(interval);
      //       reject(
      //         new Error(
      //           "OpenCV.js did not properly initialize within 2 minutes"
      //         )
      //       );
      //     } else {
      //       retries++;
      //     }
      //   }, 100); // Check every 100ms
      // }).catch((error) => {
      //   console.error(error.message);
      // });

      // Step 3: Perform canvas initialization or other setup tasks
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "white";
          ctx.font = "20px Arial";
          ctx.fillText("SCAVENGER HUNT!", 10, 30);
        }
      }

      // Update Zustand state to indicate the canvas is ready
      setCanvasReady(true);
    };

    loadOpenCV();
  }, [setCanvasReady]);

  return (
    <div className="text-center text-white">
      <canvas
        id="canvas-main"
        ref={canvasRef}
        width="640"
        height="480"
      ></canvas>
    </div>
  );
};

export default Canvas;
