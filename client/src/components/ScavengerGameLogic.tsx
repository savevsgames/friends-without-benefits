import { useEffect, useState } from "react";
import { useGameStore } from "@/store";
import ReactModal from "react-modal";

const ScavengerGame = () => {
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

  const [riddleClass, setRiddleClass] = useState("");

  useEffect(() => {
    if (numFoundItems >= 5 || timeRemaining === 0) {
      resetGame(); // Ends the game when the conditions are met
    }
  }, [numFoundItems, timeRemaining, resetGame]);

  useEffect(() => {
    if (
      gameState === "playing" &&
      canvasReady &&
      currentMediaType &&
      activeDetectionLoop
    ) {
      startTimer();
    }
  }, [
    gameState,
    canvasReady,
    currentMediaType,
    activeDetectionLoop,
    startTimer,
  ]);

  useEffect(() => {
    // Trigger animation when the riddle changes
    setRiddleClass("animate-fade-in");
    const timeout = setTimeout(() => setRiddleClass(""), 1000); // Reset class after animation
    return () => clearTimeout(timeout);
  }, [numFoundItems]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  if (!canvasReady || !currentMediaType || !activeDetectionLoop) {
    return (
      <ReactModal isOpen>
        <p>Uhmm, try refreshing? Not all states are set correctly.</p>
      </ReactModal>
    );
  }

  return (
    <div className="game-container flex flex-col items-start text-white rounded-lg shadow-lg z-50 absolute top-36 gap-4 w-72 bg-opacity-90 p-4">
      {gameState === "playing" ? (
        <>
          {/* Riddle Box */}
          <div
            className={`riddle-box p-4 rounded-lg bg-teal-950 bg-opacity-80 text-center shadow-md ${riddleClass}`}
          >
            <h1 className="text-xl font-bold mb-2 text-left">
              🧩 Solve the Riddle:
            </h1>
            <p className="text-lg font-semibold text-left">{getRiddle()}</p>
          </div>

          {/* Time Remaining */}
          <div className="time-box p-4 rounded-lg bg-teal-950 bg-opacity-80 text-center shadow-md">
            <h1 className="text-xl font-bold mb-2">⏳ Time Remaining:</h1>
            <p className="text-lg font-semibold">{formatTime(timeRemaining)}</p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h1 className="text-xl font-bold">🕹️ Game Not Started</h1>
          <p className="text-sm">Click "Start Game" to begin the hunt!</p>
        </div>
      )}
    </div>
  );
};

export default ScavengerGame;
