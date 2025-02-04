import { useEffect, useState } from "react";
import { useGameStore, useMultiplayerStore } from "@/store";
import RiddleCardFlip from "./RiddleCardFlip";
import Countdown from "./Countdown";
import "../App.css";
import { useUpdateGame } from "@/hooks/useUpdateGame";
import GameCompletionModal from "./GameCompleteModal";
import { stopDetection } from "@/utils/model-utils";

const ScavengerGame = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
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
  const stopTimer = useGameStore((state) => state.stopTimer);
  const resetGame = useGameStore((state) => state.resetGame);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const gameRoom = useGameStore((state) => state.gameRoom);
  const { updateGame } = useUpdateGame();
  const playerId = useMultiplayerStore((state) => state.playerId);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  

  // use effect to set isReady and start countdown when sever emits countdown
  useEffect(() => {
    const socket = useMultiplayerStore.getState().socket;
    const updatePlayerReadyStates =
      useMultiplayerStore.getState().updatePlayerReadyStates;
    const startCountdown = useMultiplayerStore.getState().startCountdown;

    if (socket) {
      try {
        const isSingle = useGameStore.getState().isSingle;
        if (isSingle) {
          console.log("🔗 Setting up Socket.IO event listeners...");

          // Listen for the countdown to start
          socket.on("startCountdown", (countdown: number) => {
            console.log("🚦 startCountdown event received:", countdown);
            startCountdown(countdown);
          });

          // Listen for ready state updates
          socket.on(
            "updateReadyStates",
            (readyStates: Record<string, boolean>) => {
              console.log("📥 updateReadyStates event received:", readyStates);
              updatePlayerReadyStates(readyStates);
            }
          );

          // Handle disconnect
          socket.on("disconnect", () => {
            console.warn("❌ Socket.IO disconnected unexpectedly!");
          });

          // Cleanup listeners on unmount
          return () => {
            socket.off("startCountdown");
            socket.off("updateReadyStates");
            socket.off("disconnect");
            console.log("🧹 Socket.IO listeners cleaned up");
          };
        } // no else
      } catch (error) {
        console.error("❌ Error setting up socket listeners:", error);
      }
    } else {
      console.warn("⚠️ Socket.IO connection not established yet.");
    }
  }, []);

  // useEffect(() => {
  //   if (numFoundItems >= 5 || timeRemaining === 0) {
  //     resetGame(); //this currently sets the game to "setup"
  //     // TODO: Add DB Call to save/ updateGame data
  //     //TODO: DONT JUST RESET GAME - GIVE OPTIONS:
  //     // 1. Play Again
  //     // 2. Return to Tutorial
  //     // 3. Return to Home
  //     // 4. View Leaderboard
  //     // 5. Play a Multiplayer Game
  //     // TODO: currently sets the game to "setup" -> Need to change to "complete" and wait for user input
  //     // stop detecting, etc. and show a modal with the results
  //   }
  // }, [numFoundItems, timeRemaining, resetGame]);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (gameState === "countdown" && countdown !== null) {
      console.log("🔄 Countdown Started:", countdown);

      countdownTimer = setInterval(() => {
        const currentCountdown = useGameStore.getState().countdown;
        if (currentCountdown !== null && currentCountdown > 0) {
          useGameStore.getState().setCountdown(currentCountdown - 1);
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
      // setGameStartTime(); - TODO: need to update the store and the db
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

  // bingoo msg - added itemsArr.length, timeRemaining as missing dependencies
  useEffect(() => {
    if (timeRemaining < 120 || numFoundItems !== itemsArr.length) {
      setShowSuccessMessage(true);
      const timeout = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1000); //  displayed for 1 second
      return () => clearTimeout(timeout);
    }
  }, [numFoundItems, itemsArr.length]);

  // Game start logic - should update the bd once zustand is updated
  useEffect(() => {
    if (gameRoom && gameState === "countdown" && countdown === 0) {
      console.log(
        "🚦 Game started. Updating game start state in the database..."
      );
      // set the local state to playing
      useGameStore.setState({ gameState: "playing" });

      const handleGameStart = async () => {
        try {
          await updateGame({
            gameId: gameRoom,
            isComplete: false,
            duration: 120, // Initial duration (or dynamic if needed)
            itemsFound: 0,
            winnerId: "", // Empty winner at game start
          });

          console.log("✅ Game start state updated in the database.");
          startTimer(); // Start the game timer locally
        } catch (error) {
          console.error("❌ Failed to update game start state:", error);
        }
      };

      handleGameStart();
    }
  }, [gameRoom, gameState, startTimer, updateGame, countdown]);

  // Game completion logic - needs more logic to determine winner
  // Handles the updating of the game in the database
  useEffect(() => {
    // Check if the game has completed based on conditions
    const isGameComplete = numFoundItems >= 5 || timeRemaining <= 0;

    if (isGameComplete && gameRoom && gameState === "playing") {
      console.log(
        "🎯 Game is complete. Preparing to update in the database..."
      );

      const handleGameComplete = async () => {
        try {
          console.log("🔄 Updating game completion in the database...");
          setGameState("complete"); // Reset the game locally after DB update
          stopTimer();
          stopDetection();
          await updateGame({
            gameId: gameRoom,
            isComplete: true,
            duration: 120 - timeRemaining,
            itemsFound: numFoundItems,
            winnerId: playerId || "THEWINNER", //TODO: make sure proper winner is determined
          });

          console.log("✅ Game completion updated in the database.");
          setIsModalOpen(true);
        } catch (error) {
          console.error(
            "❌ Failed to update game completion in the database:",
            error
          );
        }
      };

      handleGameComplete();
    }
  }, [
    numFoundItems,
    timeRemaining,
    gameRoom,
    updateGame,
    resetGame,
    playerId,
    setGameState,
    stopTimer,
  ]);

  // START THE GAME listener
  useEffect(() => {
    const socket = useMultiplayerStore.getState().socket;
    const startCountdown = useMultiplayerStore.getState().startCountdown;
    const isMulti = useGameStore.getState().isMulti;
    if (isMulti) {
      if (socket) {
        console.log("🔗 Setting up Socket.IO event listeners...");
        const numberOfPlayers = Object.keys(
          useMultiplayerStore.getState().players
        ).length;
        console.log("Number of players in the room: ", numberOfPlayers);
        if (numberOfPlayers > 1) {
          socket.on("startCountdown", (countdown: number) => {
            console.log("🚦 startCountdown event received:", countdown);
            startCountdown(countdown);
          });

          return () => {
            socket.off("startCountdown");
          };
        }
      }
    }
  }, []);

  return (
    <div className="game-container flex flex-col items-start text-white rounded-lg z-50 absolute right-0 gap-4 w-full bg-opacity-90 p-4">
      <div className="game-container">
        {/* gameState of "setup" */}
        {/* {gameState === "setup" && <StartGameButton />} */}

        {/* gameState of "countdown" */}
        {gameState === "countdown" && countdown !== null && <Countdown />}

        {/* gameState of "playing" */}
        {gameState === "playing" && (
          <div>
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="fixed top-12 right-4 bg-gradient-to-br from-teal-400 via-green-500 to-yellow-500 text-white text-4xl font-bold py-4 px-8 rounded-lg shadow-lg animate-bounce">
                🎉 BINGO! 🎉
              </div>
            )}
            {/* time remaining */}

            <div className="fixed inset-y-0 right-4 flex flex-col items-end justify-center">
              <div
                style={{ width: "300px" }}
                className="time-box p-4 bg-gradient-to-br from-teal-700 to-green-500 text-center mb-6 rounded-lg shadow-xl"
              >
                <h1 className="text-xl font-extrabold mb-2 text-white tracking-wider">
                  Tick ⏳ Tock
                </h1>
                <p className="text-lg font-semibold text-white">
                  {formatTime(timeRemaining)}
                </p>
                <div className="relative w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div
                    className="absolute right-0 h-full bg-gradient-to-r from-teal-700 to-teal-500 transition-width duration-500"
                    style={{ width: `${(timeRemaining / 120) * 100}%` }}
                  ></div>
                </div>
              </div>
              <RiddleCardFlip
                numFoundItems={numFoundItems}
                itemsArr={itemsArr}
              />
            </div>
          </div>
        )}
        {/* {gameState === "complete" && (
          <div>
            <h1>Game Over</h1>
            <p>YOU WON OR LOST & FOUND {itemsArr[numFoundItems]} ITEMS!</p>
            <p>YOU HAD {timeRemaining} time left!</p>
          </div>
        )} */}
        <GameCompletionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          // timeRemaining={timeRemaining}
          // itemsFound={numFoundItems}
          // totalItems={itemsArr.length}
          // setGameState={setGameState}
          // resetGame={resetGame}
        />
      </div>
    </div>
  );
};

export default ScavengerGame;
