import { useGameStore } from "@/store";

const GameStates = () => {
  const {
    gameState,
    currentMediaType,
    canvasReady,
    videoPlaying,
    isSingle,
    isMulti,
  } = useGameStore(); // Access Zustand state

  return (
    <nav
      className="fixed bottom-12 right-6 z-50 flex flex-col gap-4 items-end"
      style={{
        pointerEvents: "none", // Ensures it doesn't interfere with canvas interactions
      }}
    >
      {/* Game State */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-teal-800 via-teal-500 to-purple-500 bg-opacity-75 text-xs text-white shadow dark:bg-gray-700 dark:text-gray-200 w-48 pointer-events-auto">
        <span>🎮 Game State:</span>
        <span className="font-semibold truncate">{gameState}</span>
      </div>

      {/* Media Type */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-teal-800 via-teal-500 to-purple-500 bg-opacity-75 text-xs text-white shadow dark:bg-gray-700 dark:text-gray-200 w-48 pointer-events-auto">
        <span>📹 Media Type:</span>
        <span className="font-semibold truncate">
          {currentMediaType || "N/A"}
        </span>
      </div>

      {/* Canvas Ready */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-teal-800 via-teal-500 to-purple-500 bg-opacity-75 text-xs text-white shadow dark:bg-gray-700 dark:text-gray-200 w-48 pointer-events-auto">
        <span>🖌️ Canvas Ready:</span>
        <span className="font-semibold truncate">
          {canvasReady ? "Yes" : "No"}
        </span>
      </div>
      {/* Video playing */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-teal-800 via-teal-500 to-purple-500 bg-opacity-75 text-xs text-white shadow dark:bg-gray-700 dark:text-gray-200 w-48 pointer-events-auto">
        <span>🖌️ Video Playing:</span>
        <span className="font-semibold truncate">
          {videoPlaying ? "Yes" : "No"}
        </span>
      </div>

      {/* Single Player */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-teal-800 via-teal-500 to-purple-500 bg-opacity-75 text-xs text-white shadow dark:bg-gray-700 dark:text-gray-200 w-48 pointer-events-auto">
        <span>👤 Single Player:</span>
        <span className="font-semibold truncate">
          {isSingle ? "Enabled" : "Disabled"}
        </span>
      </div>

      {/* Multi Player */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-teal-800 via-teal-500 to-purple-500 bg-opacity-75 text-xs text-white shadow dark:bg-gray-700 dark:text-gray-200 w-48 pointer-events-auto">
        <span>👥 Multi Player:</span>
        <span className="font-semibold truncate">
          {isMulti ? "Enabled" : "Disabled"}
        </span>
      </div>
    </nav>
  );
};

export default GameStates;
