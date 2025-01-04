import { useEffect } from "react";
import { useGameStore } from "@/store";
// import { useMultiplayerStore } from "@/store";
// import type { Player } from "@/store";

const ScavengerGame = () => {
  //   const players = useMultiplayerStore((state) => state.players);

  const gameState = useGameStore((state) => state.gameState);
  const canvasReady = useGameStore((state) => state.canvasReady);
  const currentMediaType = useGameStore((state) => state.currentMediaType);
  const activeDetectionLoop = useGameStore(
    (state) => state.activeDetectionLoop
  );
  const numFoundItems = useGameStore((state) => state.numFoundItems);
  const itemsArr = useGameStore((state) => state.itemsArr);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const startTimer = useGameStore((state) => state.startTimer);
  const resetGame = useGameStore((state) => state.resetGame);

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
    return <div>Game components not loaded correctly...</div>;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
