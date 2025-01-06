import { useEffect, useState } from "react";
import { useGameStore } from "@/store";
import { useMultiplayerStore } from "@/store";
// import StartGameButton from "./buttons/StartGameButton";
import Countdown from "./Countdown";
import "../App.css";

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
  const [riddleClass, setRiddleClass] = useState("");
  const getRiddle = () => {
    const riddles: Record<string, string> = {
      Mug: "I hold your drink, be it coffee or tea, find me! ☕",
      Headphones:
        "Put me on to hear a tune, I sit on your ears and block out the room, find me! 🎧",
      Toothbrush:
        "I help you keep your teeth pearly white, use me in the morning and at night, find me! 🪥",
      Fork: "I have prongs but I'm not a plug. I sit at the table and help you eat! 🍴",
      Remote: "I let you switch channels while you relax, find me! 📺",
    };
    return riddles[itemsArr[numFoundItems]] || "Scavenge Complete!";
  };
  useEffect(() => {
    // Trigger animation when the riddle changes
    setRiddleClass("animate-fade-in bg-highlight");
    const timeout = setTimeout(() => setRiddleClass(""), 1000); // Reset class after animation
    return () => clearTimeout(timeout);
  }, [numFoundItems]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
    <div className="game-container flex flex-col items-start text-white rounded-lg z-50 absolute right-0 gap-4 w-full bg-opacity-90 p-4">
      <div className="game-container">
        {/* gameState of "setup" */}
        {/* {gameState === "setup" && <StartGameButton />} */}

        {/* gameState of "countdown" */}
        {gameState === "countdown" && countdown !== null && <Countdown />}

        {/* gameState of "playing" */}
        {gameState === "playing" && (
          <div>
            <div
              className={`riddle-box fixed p-4  bg-teal-950 bg-opacity-80 text-center mb-6 bottom-12 left-1/2 transform -translate-x-1/2 rounded-lg shadow-lg ${riddleClass}`}
            >
              <h1 className="text-xl font-bold mb-2 text-left">
                🧩 Solve the Riddle:
              </h1>
              <p className="text-lg font-semibold text-left">{getRiddle()}</p>
            </div>

            {/* Time Remaining */}
            <div className="time-box p-4  bg-teal-950 bg-opacity-80 text-center mb-6 bottom-12 left-24 transform rounded-lg shadow-lg">
              <h1 className="text-xl font-bold mb-2">⏳ Time Remaining:</h1>
              <p className="text-lg font-semibold">
                {formatTime(timeRemaining)}
              </p>
              <div className="relative w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="absolute top-0 left-0 h-full bg-teal-500 transition-width duration-500"
                  style={{ width: `${(timeRemaining / 120) * 100}%` }}
                ></div>
              </div>
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
