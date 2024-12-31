import { useEffect, useRef } from "react";
import Header from "@/components/Header.tsx";

import Canvas from "../components/Canvas.tsx";

import { useGameStore } from "@/store";
// import MultiplayerInitializer from "@/components/MulitplayerInitializer.ts";
// import { loadModel } from "@/utils/ml5-model-utils.ts";
import SideBar from "@/components/SideBar.tsx";
import { enableWebcam } from "@/utils/model-utils";

function Game() {
    const setCanvasReady = useGameStore((state: any) => state.setCanvasReady);
    const modelRef = useRef<any>(null);
  
    const processYOLOPredictions = (predictionArray: any) => {
      const GRID_SIZE = 13;
      const NUM_CLASSES = 5; 
      const boxes = [];
      
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const output = predictionArray[0][i][j];
          const objectness = output[4];
          
          if (objectness > 0.5) { // Confidence threshold
            const x = (output[0] + j) / GRID_SIZE;
            const y = (output[1] + i) / GRID_SIZE;
            const w = Math.exp(output[2]) / GRID_SIZE;
            const h = Math.exp(output[3]) / GRID_SIZE;
            
            // Get class probabilities
            const classes = output.slice(5, 5 + NUM_CLASSES);
            const classIndex = classes.indexOf(Math.max(...classes));
            const confidence = classes[classIndex];
            
            if (confidence > 0.5) {
              boxes.push({
                x: x - w/2,
                y: y - h/2,
                width: w,
                height: h,
                class: classIndex,
                confidence
              });
            }
          }
        }
      }
      return boxes;
    };
  
    useEffect(() => {
      let animationFrameId: number;
  
      const init = async () => {
        const stream = await enableWebcam();
        if (!stream) return;
  
        const videoElement = document.getElementById("video-output") as HTMLVideoElement;
        console.log('Video element found:', !!videoElement, 'Playing:', !videoElement?.paused);
        const canvas = document.getElementById("canvas-container")?.querySelector("canvas");
        console.log('Canvas found:', !!canvas);
        
        if (!videoElement || !canvas) {
          console.error("Required elements not found");
          return;
        }
  
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
  
        try {
          console.log('Loading model...');
          modelRef.current = await (window as any).tf.loadGraphModel('./src/assets/model.json');
          console.log('Model loaded successfully');
  
          const detect = async () => {
            console.log('Starting detection...');
            if (!modelRef.current || !videoElement) {
              console.log('Missing refs:', { model: !!modelRef.current, video: !!videoElement });
              return;
            }
  
            try {
              const tfImg = (window as any).tf.browser.fromPixels(videoElement);
              const resized = (window as any).tf.image.resizeBilinear(tfImg, [416, 416]);
              const expandedImg = resized.expandDims(0);
              
              const predictions = await modelRef.current.predict(expandedImg);
              const predictionArray = await predictions.array();
              const boxes = processYOLOPredictions(predictionArray);
              
              // Draw detections
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              
              boxes.forEach(box => {
                const x = box.x * canvas.width;
                const y = box.y * canvas.height;
                const width = box.width * canvas.width;
                const height = box.height * canvas.height;
                
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
                ctx.fillStyle = '#00ff00';
                ctx.fillText(`Class ${box.class} (${Math.round(box.confidence * 100)}%)`, x, y - 5);
              });
  
              tfImg.dispose();
              resized.dispose();
              expandedImg.dispose();
              predictions.dispose();
            } catch (error) {
              console.error('Detection error:', error);
            }
  
            animationFrameId = requestAnimationFrame(detect);
          };
  
          detect();
        } catch (error) {
          console.error('Error loading model:', error);
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
