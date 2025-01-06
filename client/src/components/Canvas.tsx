import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store"; // Import Zustand store
import MultiplayerChat from "./MultiplayerChat";
import MultiplayerVideoFeed from "./MultiplayerVideoFeed";
import ScavengerGame from "./ScavengerGameLogic";
import GameStates from "./GameStates.tsx";
import ControlPanel from "./ControlPanel.tsx";
import TutoModal from "./TutoModal.tsx";
import ChoiceScreen from "./ChoiceScreen.tsx";
// import { loadImageToCanvas } from "@/utils/model-utils";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, videoPlaying } = useGameStore(); // Access Zustand state

  const [welcomeImageLoaded, setWelcomeImageLoaded] = useState(false);

  const singlePlayer = useGameStore((state) => state.isSingle);

  const multiPlayer = useGameStore((state) => state.isMulti);
  // show choices modal
  const [showChoices, setShowChoices] = useState(true);
  const [showTuto, setShowTuto] = useState(false); // Controls Tutorial modal visibility
  // manage tutorial steps

  const handleStartTuto = () => {
    setTutorialStep(1);
    setShowChoices(false);
    setShowTuto(true);
  };

  const handleTurnOnCamera = () => {
    console.log("Camera turned on!");
  };
  const [tutorialStep, setTutorialStep] = useState(0); // Manage tutorial steps
  // Tutorial modal content
  const tutorialContent = [
    "Welcome to Scavenger Hunt! Let's learn how to play, shall we?",
    "🧩 Solve the riddle: A riddle will appear on the screen. Solve it to identify the item you need to find. Let your detective skills shine!",
    "⏳ Watch the clock:Tick-tock! Keep an eye on the riddle timer. Time is precious and every second counts!",
    "🚀 Start the game: Ready, set, go! Click 'Start Game' on the main menu to kick off the countdown",
    "🕵️‍♂️ Begin the Hunt: Let the Scavenger Hunt begin! Search for items, solve riddles, and HAVE FUN!",
  ];
  // function to handle the tutorial once the single player selection is established
  // Trigger tutorial when single-player is selected

  const handleNextStep = () => {
    if (tutorialStep < tutorialContent.length) {
      setTutorialStep((prev) => prev + 1);
    } else {
      setTutorialStep(0);
      setShowChoices(true);
      setShowTuto(false); // End the tutorial
    }
  };
  // handle the skip tuto
  const handleSkipTuto = () => {
    setTutorialStep(0);
    setShowChoices(true);
    setShowTuto(false);
  };
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
    } else if (gameState === "complete") {
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
          // context.fillText("SCAVENGER HUNT 2025", 10, 30);
          context.globalAlpha = 1; // Reset transparency
        }
      }

      // Update Zustand state to indicate the canvas is ready
      setCanvasReady(true);
      console.log("Canvas is ready: ", useGameStore.getState().canvasReady);
      console.log("Game State: ", useGameStore.getState().gameState);
    };

    loadOpenCV();
  }, [setCanvasReady]);
  // Return the canvas component when currentMediaRef changes and type is set to an image or video

  // TEMPORARY - FOR MAKING SURE THE CANVAS WORKS - LOADS AN IMAGE TO CANVAS ON FIRST LOAD
  // Onload, load the welcome image as a file and display it on the canvas
  const welcomeImgPath = "/assets/household_items_01.png";
  useEffect(() => {
    if (welcomeImageLoaded) return; // Ensure this runs only once

    const loadWelcomeImage = async () => {
      const imageElement = document.getElementById(
        "image-output"
      ) as HTMLImageElement;
      const canvasElement = document.getElementById(
        "canvas-main"
      ) as HTMLCanvasElement;
      const canvasContainer = document.getElementById(
        "canvas-container"
      ) as HTMLDivElement;

      try {
        // Fetch the image as a Blob
        const response = await fetch(welcomeImgPath);
        if (!response.ok) throw new Error("Failed to fetch the image");

        const blob = await response.blob();
        const file = new File([blob], "household_items_01.png", {
          type: "image/png",
        });

        // Set the image source
        imageElement.src = URL.createObjectURL(file);

        // Wait for image to load
        imageElement.onload = () => {
          console.log(
            `Image loaded: ${imageElement.naturalWidth}x${imageElement.naturalHeight}`
          );

          // Resize canvas-container dynamically
          canvasContainer.style.height = `${imageElement.clientHeight}px`;

          // Set canvas dimensions to match image
          canvasElement.width = imageElement.naturalWidth;
          canvasElement.height = imageElement.naturalHeight;

          console.log("Canvas and container resized to image dimensions:", {
            Cwidth: canvasElement.width,
            Cheight: canvasElement.height,
          });
        };

        imageElement.onerror = () => {
          console.error("Failed to load the image into #image-output");
        };
      } catch (error) {
        console.error("Error loading the image:", error);
      }

      setWelcomeImageLoaded(true); // Mark image as loaded
    };

    loadWelcomeImage();
  }, [welcomeImageLoaded]);

  return (
    <div
      id="game-container"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        minWidth: "300px",
        height: "calc(100vh-64px)",
      }}
    >
      <ChoiceScreen
        isOpen={showChoices}
        onClose={() => setShowChoices(false)}
        onStartTuto={handleStartTuto}
        onTurnOnCamera={handleTurnOnCamera}
      />
      {/* tutorial modal */}
      {!multiPlayer && (
        <TutoModal
          isOpen={showTuto}
          content={tutorialContent}
          currentStep={tutorialStep - 1}
          onNext={handleNextStep}
          onSkip={handleSkipTuto}
          isLastStep={tutorialStep === tutorialContent.length}
        />
      )}
      <div
        id="canvas-container"
        className="relative w-full h-full"
        style={{
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          maxWidth: singlePlayer ? "100vw" : "60vw",
          maxHeight: singlePlayer ? "100vh" : "90vh",
          flex: singlePlayer ? "1 1 auto" : "initial",
        }}
      >
        <canvas
          id="canvas-main"
          ref={canvasRef}
          style={{
            display: "block",
            // position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        ></canvas>
        <ControlPanel />
        <GameStates />
        <ScavengerGame />

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
            objectFit: "contain",
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
            objectFit: "contain",
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
      {/* New Div Right of Canvas */}
      {multiPlayer && (
        <div
          className="relative z-20 p-4"
          style={{
            marginTop: "10px",
            flex: "1 1 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateRows: "2fr 5fr",
              gap: "2rem",
            }}
          >
            <div className="border-2 border-black background-teal-200 dark:bg-teal-950">
              <MultiplayerVideoFeed />
            </div>
            <MultiplayerChat />
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
