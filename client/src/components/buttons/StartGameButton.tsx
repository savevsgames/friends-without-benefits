import React from "react";
import { useMultiplayerStore } from "@/store";
import { useGameStore } from "@/store";

const StartGameButton: React.FC = () => {
  const playerId = useMultiplayerStore((state) => state.playerId) || "";
  const players = useMultiplayerStore((state) => state.players);
  const setPlayerReady = useMultiplayerStore((state) => state.setPlayerReady);

  const isReady = players[playerId]?.isReady || false;

  console.log("Button [StartGameButton] => isReady before click: ", isReady);

  const setCurrentMediaType = useGameStore(
      (state) => state.setCurrentMediaType
    );
    const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
    const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
    const canvasReady = useGameStore((state) => state.canvasReady);
    const videoPlaying = useGameStore((state) => state.videoPlaying);

  const handleReadyClick = () => {
    // PlayerId is guaranteed to be defined here in our app flow
    // This will go back to the store and update the players object:
    /**
     * players: {
        ...state.players,
        [id]: { ...state.players[id], isReady: ready },
      },
     */

    setPlayerReady(playerId!, !isReady);
    console.log("Button [StartGameButton] => isReady after click: ", isReady);
    
  };
  

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        style={{
          backgroundColor: "blue",
          color: "white",
          fontSize: "1.5rem",
          fontWeight: "bold",
          zIndex: 3,
        }}
        onClick={handleReadyClick}
        className={`btn ${isReady ? "btn-disabled" : "btn-primary"}`}
      >
        {isReady ? "Waiting for other players..." : "I'm ready to go!"}
      </button>
    </div>
  );
};

export default StartGameButton;
