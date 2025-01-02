
/* eslint-disable */
import { useEffect, useRef } from "react";
import Header from "@/components/Header.tsx";
// import * as cvstfjs from '@microsoft/customvision-tfjs';
import Canvas from "../components/Canvas.tsx";

import { useGameStore } from "@/store";
// import MultiplayerInitializer from "@/components/MulitplayerInitializer.ts";
// import { loadModel } from "@/utils/ml5-model-utils.ts";
import SideBar from "@/components/SideBar.tsx";
import { enableWebcam } from "@/utils/model-utils";
// import { model } from "@tensorflow/tfjs";

declare const cvstfjs: any;

function Game() {
  const setCanvasReady = useGameStore((state: any) => state.setCanvasReady);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    let animationFrameId: number;

    const init = async () => {
      const stream = await enableWebcam();
      if (!stream) return;

      const videoElement = document.getElementById(
        "video-output"
      ) as HTMLVideoElement;
      const canvas = document
        .getElementById("canvas-container")
        ?.querySelector("canvas");

      if (!videoElement || !canvas) {
        console.error("Required elements not found");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        console.log("Loading model...");
        window.cvsModel = new cvstfjs.ObjectDetectionModel();
        await window.cvsModel.loadModelAsync("/models/tfjs/model.json");
        modelRef.current = window.cvsModel;
        console.log("Model loaded successfully cvstfjs");
        console.log(modelRef.current);

        const detect = async () => {
          if (!modelRef.current || !videoElement) return;

          try {
            const result = await modelRef.current.executeAsync(videoElement);
            console.log("Detection result:", result);
            const [boxes, scores, classes] = result;

            //   if (!Array.isArray(result)) {
            //     console.error('Expected array result from detection');
            //     return;
            //   }
            // Clear and draw video frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            // Draw predictions
            boxes.forEach((box: number[], index: number) => {
              const score = scores[index];
              if (score < 0.5) return; // Confidence threshold

              const [y1, x1, y2, x2] = box;
              const width = (x2 - x1) * canvas.width;
              const height = (y2 - y1) * canvas.height;

              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 2;
              ctx.strokeRect(
                x1 * canvas.width,
                y1 * canvas.height,
                width,
                height
              );
              ctx.fillStyle = "#00ff00";
              ctx.fillText(
                `Class ${classes[index]} (${Math.round(score * 100)}%)`,
                x1 * canvas.width,
                y1 * canvas.height - 5
              );
            });
          } catch (error) {
            console.error("Detection error:", error);
          }

          animationFrameId = requestAnimationFrame(detect);
        };

        detect();
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };

    init();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [setCanvasReady]);

  return (
    <>
      {/* Multiplayer initializer has no dimensions - used to initialize socket-io and peerjs with server */}
      {/* <MultiplayerInitializer /> */}
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
