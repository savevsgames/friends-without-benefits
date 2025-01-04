import React from "react";
import { useMultiplayerStore } from "@/store";

const StartGameButton: React.FC = () => {
  const playerId = useMultiplayerStore((state) => state.playerId) || "";
  const players = useMultiplayerStore((state) => state.players);
  const setPlayerReady = useMultiplayerStore((state) => state.setPlayerReady);

  const isReady = players[playerId]?.isReady || false;

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
  };

  return (
    <button
      style={{
        backgroundColor: "blue",
        color: "white",
        fontSize: "2rem",
        fontWeight: "bold",
      }}
      onClick={handleReadyClick}
      className={`btn ${isReady ? "btn-disabled" : "btn-primary"}`}
    >
      {isReady ? "Waiting for other players..." : "I'm ready to go!"}
    </button>
  );
};

export default StartGameButton;
