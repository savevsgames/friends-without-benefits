import React, { useEffect, useRef } from "react";
import { useGameStore } from "../store"; // Import Zustand store

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Access Zustand state
  const gameState = useGameStore((state) => state.gameState);
  // Log the current game state
  if (gameState === "setup") {
    console.log("Game State is Setup");
  } else if (gameState === "playing") {
    console.log("Game State is Playing");
  } else if (gameState === "gameover") {
    console.log("Game State is Game Over");
  } else {
    console.log("Game State is Unknown");
  }

  // Set Canvas Ready state with setCanvasReady once OpenCV.js is initialized
  const setCanvasReady = useGameStore((state) => state.setCanvasReady);

  useEffect(() => {
    // Wait for OpenCV.js to initialize - porting from basic js version in Demo-Files into react
    const initializeCV = async () => {
      await new Promise<void>((resolve) => {
        const checkCV = () => {
          if (window.cv && window.cv.onRuntimeInitialized) {
            window.cv.onRuntimeInitialized = resolve;
          } else {
            setTimeout(checkCV, 50);
          }
        };
        checkCV();
      });

      console.log("OpenCV.js is ready");

      // Perform canvas initialization or drawing here
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "white";
          ctx.font = "20px Arial";
          ctx.fillText("Canvas Ready", 10, 30);
        }
      }

      // Update Zustand state to indicate the canvas is ready
      setCanvasReady(true);
    };

    initializeCV();
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
