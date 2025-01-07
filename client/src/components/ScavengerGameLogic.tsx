import { useEffect, useState } from "react";
import { useGameStore, useMultiplayerStore } from "@/store";
// import { useMultiplayerStore } from "@/store";
import RiddleCardFlip from "./RiddleCardFlip";
// import StartGameButton from "./buttons/StartGameButton";
import Countdown from "./Countdown";
import "../App.css";

const ScavengerGame = () => {
  const startCountdown = useMultiplayerStore((state) => state.startCountdown);
  const isTimeForCountdown = useMultiplayerStore.getState().isTimeForCountdown;
  // const socket = useMultiplayerStore((state) => state.socket);
  // const updatePlayerReadyStates = useMultiplayerStore(
  //   (state) => state.updatePlayerReadyStates
  // );

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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // useEffect(() => {
  //   if (socket) {
  //     try {
  //       // console.log("socket testing for start game button: ", socket);
  //       // Server sends the countdown to start the game
  //       socket.on("startCountdown", (countdown: number) => {
  //         console.log("startCountdown event received: ", countdown);
  //         startCountdown(countdown);
  //       });
  //       // When the game is multiplayer, we need to update the ready
  //       // states of the players in the store when the server sends an update
  //       socket.on("updateReadyStates", updatePlayerReadyStates);

  //       socket.on("disconnect", () => {
  //         console.warn("Socket IO DISCONNECTED UNEXPECTEDLY");
  //       });

  //       return () => {
  //         socket.off("startCountdown");
  //         socket.off("updateReadyStates");
  //         socket.off("disconnect");
  //       };
  //     } catch (error) {
  //       console.log("Error starting countdown", error);
  //     }
  //   }
  // }, [socket, startCountdown, updatePlayerReadyStates]);

  useEffect(() => {
    if (numFoundItems >= 5 || timeRemaining === 0) {
      resetGame(); //this currently sets the game to "setup"
      // TODO: Add DB Call to save/ updateGame data
      //TODO: DONT JUST RESET GAME - GIVE OPTIONS:
      // 1. Play Again
      // 2. Return to Tutorial
      // 3. Return to Home
      // 4. View Leaderboard
      // 5. Play a Multiplayer Game
      // TODO: currently sets the game to "setup" -> Need to change to "complete" and wait for user input
      // stop detecting, etc. and show a modal with the results
    }
  }, [numFoundItems, timeRemaining, resetGame]);

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
    if (isTimeForCountdown) {
      startCountdown(5);
    }
  }, [isTimeForCountdown, startCountdown]);

  // useEffect(() => {
  //   let countdownTimer: NodeJS.Timeout | null = null;

  //   if (gameState === "countdown" && countdown !== null) {
  //     console.log("🔄 Countdown Started:", countdown);

  //     countdownTimer = setInterval(() => {
  //       useGameStore.setState((state) => {
  //         // Actually set the state of the countdown in the store
  //         if (state.countdown && state.countdown > 0) {
  //           return { countdown: state.countdown - 1 };
  //         } else {
  //           clearInterval(countdownTimer!);
  //           return { countdown: 0 };
  //         }
  //       });
  //     }, 1000);
  //   }

  //   return () => {
  //     if (countdownTimer) {
  //       clearInterval(countdownTimer);
  //       console.log("🛑 Countdown Timer Cleared");
  //     }
  //   };
  // }, [gameState, countdown]);

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
    if (timeRemaining < 120 || numFoundItems === itemsArr.length) {
      setShowSuccessMessage(true);
      const timeout = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1000); //  displayed for 1 second
      return () => clearTimeout(timeout);
    }
  }, [numFoundItems]);

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
              <div className="fixed top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2  bg-gradient-to-br from-teal-400 via-green-500 to-yellow-500 text-white text-4xl font-bold py-4 px-8 rounded-lg shadow-lg animate-bounce">
                🎉 BINGO! 🎉
              </div>
            )}
            {/* time remaining */}

            <div className="fixed bottom-4 left-15 flex flex-col gap-">
              <div className="time-box p-4 bg-gradient-to-br from-teal-700 to-green-500 text-center mb-6 bottom-12 left-24 transform rounded-lg shadow-xl " >
                <h1 className="text-xl font-extrabold mb-2 text-white tracking-wider">
                  Tick ⏳ Tock
                </h1>
                <p className="text-lg font-semibold text-white">
                  {formatTime(timeRemaining)}
                </p>
                <div className="relative w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-orange-500 transition-width duration-500"
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
