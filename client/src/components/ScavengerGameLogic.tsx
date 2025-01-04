import { useEffect } from "react";
import { useGameStore } from "@/store";
import { useMultiplayerStore } from "@/store";
import StartGameButton from "./buttons/StartGameButton";

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (socket) {
      // console.log("socket testing for start game button: ", socket);
      // Server sends the countdown to start the game
      socket.on("startCountdown", (countdown: number) => {
        console.log("startCountdown event received");
        startCountdown(countdown);
      });
      // When the game is multiplayer, we need to update the ready
      // states of the players in the store when the server sends an update
      socket.on("updateReadyStates", updatePlayerReadyStates);

      return () => {
        socket.off("startCountdown");
        socket.off("updateReadyStates");
      };
    }
  }, [socket, startCountdown, updatePlayerReadyStates]);

  useEffect(() => {
    if (numFoundItems >= 5 || timeRemaining === 0) {
      resetGame(); //this currently sets the game to "setup"
    }
  }, [numFoundItems, timeRemaining, resetGame]);

  useEffect(() => {
    if (
      gameState === "countdown" &&
      canvasReady &&
      currentMediaType !== null &&
      activeDetectionLoop !== null &&
      countdown !== null
    ) {
      console.log("All conditions met. Starting the countdown timer...");
      // startTimer();
      const countdownTimer = setInterval(() => {
        // Subtract 1 from store countdown every 1 s
        useGameStore
          .getState()
          .setCountdown((prev: number | null) =>
            prev !== null ? prev - 1 : null
          );
      }, 1000);

      if (countdown === 0) {
        console.log("Countdown ended...");
        clearInterval(countdownTimer);
        startTimer();
      }

      return () => clearInterval(countdownTimer);
    }
  }, [
    gameState,
    canvasReady,
    currentMediaType,
    activeDetectionLoop,
    startTimer,
    countdown,
  ]);

  if (
    !canvasReady ||
    currentMediaType === null ||
    activeDetectionLoop === null
  ) {
    return (
      <div
        style={{
          backgroundColor: "blue",
          color: "white",
          fontSize: "1.5rem",
          fontWeight: "bold",
          margin: "auto",
          padding: "2rem",
        }}
      >
        Game components not loaded yet / detection not running...
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-container">
        {/* gameState of "setup" */}
        {gameState === "setup" && <StartGameButton />}

        {/* gameState of "countdown" */}
        {gameState === "countdown" && countdown !== null && (
          <div>
            <h1 className="countdown-number">{countdown}</h1>
          </div>
        )}

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
