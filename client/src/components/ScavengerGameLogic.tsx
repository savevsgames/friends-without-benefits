import { useEffect, useState } from "react";
import { useGameStore } from "@/store";
import { useMultiplayerStore } from "@/store";
import StartGameButton from "./buttons/StartGameButton";
import Countdown from "./Countdown";
import ReactModal from "react-modal";

const ScavengerGame = () => {
  const startCountdown = useMultiplayerStore((state) => state.startCountdown);
  const socket = useMultiplayerStore((state) => state.socket);
  const updatePlayerReadyStates = useMultiplayerStore(
    (state) => state.updatePlayerReadyStates
  );

  const gameState = useGameStore((state) => state.gameState);
  const canvasReady = useGameStore((state) => state.canvasReady);
  const currentMediaType = useGameStore((state) => state.currentMediaType);
  const activeDetectionLoop = useGameStore(
    (state) => state.activeDetectionLoop
  );
  const numFoundItems = useGameStore((state) => state.numFoundItems);
  const itemsArr = useGameStore((state) => state.itemsArr);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const countdown = useGameStore((state) => state.countdown);
  const startTimer = useGameStore((state) => state.startTimer);
  const resetGame = useGameStore((state) => state.resetGame);

  // const formatTime = (seconds: number) => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${mins}:${secs.toString().padStart(2, "0")}`;
  // };

  useEffect(() => {
    if (socket) {
      try {
        // console.log("socket testing for start game button: ", socket);
        // Server sends the countdown to start the game
        socket.on("startCountdown", (countdown: number) => {
          console.log("startCountdown event received: ", countdown);
          startCountdown(countdown);
        });
        // When the game is multiplayer, we need to update the ready
        // states of the players in the store when the server sends an update
        socket.on("updateReadyStates", updatePlayerReadyStates);

        socket.on("disconnect", () => {
          console.warn("Socket IO DISCONNECTED UNEXPECTEDLY");
        });

        return () => {
          socket.off("startCountdown");
          socket.off("updateReadyStates");
          socket.off("disconnect");
        };
      } catch (error) {
        console.log("Error starting countdown", error);
      }
    }
  }, [socket, startCountdown, updatePlayerReadyStates]);

  useEffect(() => {
    if (numFoundItems >= 5 || timeRemaining === 0) {
      resetGame(); //this currently sets the game to "setup"
    }
  }, [numFoundItems, timeRemaining, resetGame]);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (gameState === "countdown" && countdown !== null) {
      console.log("🔄 Countdown Started:", countdown);

      countdownTimer = setInterval(() => {
        const currentCountdown = useGameStore.getState().countdown;
        if (currentCountdown !== null && currentCountdown > 0) {
          return currentCountdown - 1;
        } else {
          clearInterval(countdownTimer);
          return 0; // countdown is over
        }
      }, 1000);
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        console.log("🛑 Countdown Timer Cleared");
      }
    };
  }, [gameState, countdown, startTimer]);

  useEffect(() => {
    if (
      canvasReady &&
      currentMediaType !== null &&
      activeDetectionLoop !== null &&
      gameState === "countdown" &&
      countdown === 0
    ) {
      startTimer();
      console.log("🚀 THE GAME IS STARTING!!!!");
    }
  }, [
    canvasReady,
    currentMediaType,
    activeDetectionLoop,
    gameState,
    countdown,
    startTimer,
  ]);

  return (
    <div className="game-container">
      <div className="game-container">
        {/* gameState of "setup" */}
        {gameState === "setup" && <StartGameButton />}

        {/* gameState of "countdown" */}
        {gameState === "countdown" && countdown !== null && <Countdown />}

        {/* gameState of "playing" */}
        {gameState === "playing" && (
          <div>
            <h1>Time: {timeRemaining}</h1>
            <h1>Find: {itemsArr[numFoundItems] || "Scavenge Complete!"}</h1>
          </div>
        )}
        {gameState === "complete" && (
          <div>
            <h1>Game Over</h1>
            <p>YOU WON OR LOST & FOUND {itemsArr[numFoundItems]} ITEMS!</p>
            <p>YOU HAD {timeRemaining} time left!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScavengerGame;
