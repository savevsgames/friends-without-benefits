import { useEffect } from "react";
import { useGameStore } from "@/store";
import { useMultiplayerStore } from "@/store";
import StartGameButton from "./buttons/StartGameButton";

const ScavengerGame = () => {
  //   const startCountdown = useMultiplayerStore((state) => state.startCountdown);
  const socket = useMultiplayerStore((state) => state.socket);
  //   const updatePlayerReadyStates = useMultiplayerStore(
  //     (state) => state.updatePlayerReadyStates
  //   );

  const gameState = useGameStore((state) => state.gameState);
  const canvasReady = useGameStore((state) => state.canvasReady);
  const currentMediaType = useGameStore((state) => state.currentMediaType);
  const activeDetectionLoop = useGameStore(
    (state) => state.activeDetectionLoop
  );
  const numFoundItems = useGameStore((state) => state.numFoundItems);
  const itemsArr = useGameStore((state) => state.itemsArr);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  //   const countdown = useGameStore((state) => state.countdown);
  const startTimer = useGameStore((state) => state.startTimer);
  const resetGame = useGameStore((state) => state.resetGame);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (socket) {
      console.log("socket testing for start game button: ", socket);
      // This will update the updateReadyStates and startCountdown in the store if there is a socket
    }
  }, []);

  useEffect(() => {
    if (numFoundItems >= 5 || timeRemaining === 0) {
      resetGame(); //this currently sets the game to "setup"
    }
  }, [numFoundItems, timeRemaining, resetGame]);

  useEffect(() => {
    if (
      gameState === "playing" &&
      canvasReady &&
      currentMediaType !== null &&
      activeDetectionLoop !== null
    ) {
      console.log("All conditions met");
      startTimer();
    }
  }, [
    gameState,
    canvasReady,
    currentMediaType,
    activeDetectionLoop,
    startTimer,
  ]);

  if (
    !canvasReady ||
    currentMediaType === null ||
    activeDetectionLoop === null
  ) {
    return <div>Game components not loaded yet / detection not running...</div>;
  } else if (
    canvasReady &&
    currentMediaType !== null &&
    activeDetectionLoop !== null &&
    gameState === "setup"
  ) {
    return (
      <div>
        <StartGameButton />
      </div>
    );
  }

  return (
    <div className="game-container">
      {gameState === "playing" ? (
        <div>
          <h1>Time: {formatTime(timeRemaining)}</h1>
          <h1>Find: {itemsArr[numFoundItems] || "Scavenge Complete!"}</h1>
        </div>
      ) : (
        <div>Game not started</div>
      )}
    </div>
  );
};

export default ScavengerGame;
