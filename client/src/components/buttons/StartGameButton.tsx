import React from "react";
import { useMultiplayerStore } from "@/store";

const StartGameButton: React.FC = () => {
    const playerId = useMultiplayerStore((state) => state.playerId);
    const players = useMultiplayerStore((state) => state.players);
    const setPlayerReady = useMultiplayerStore((state) => state.setPlayerReady);

    const isReady = players[playerId]?.isReady || false;

    const handleReadyClick = () => {
        setPlayerReady(playerId!, !isReady);
    };

    return (
        <button 
            onClick={handleReadyClick} 
            className={`btn ${isReady ? "btn-disabled" : "btn-primary"}`}
        >
            {isReady ? "Waiting for other players..." : "Ready Up"}
        </button>
    );
};

export default StartGameButton;
