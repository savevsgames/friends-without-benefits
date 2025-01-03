import React, { useState, useEffect } from "react";
import { useGameStore } from "@/store";
import ReactModal from "react-modal";

const ScavengerGame: React.FC = () => {
    const gameState = useGameStore((state) => state.gameState);
    const setGameState = useGameStore((state) => state.setGameState);
    const canvasReady = useGameStore((state) => state.canvasReady);
    const currentMediaType = useGameStore((state) => state.currentMediaType);
    const activeDetectionLoop = useGameStore((state) => state.activeDetectionLoop);
    const foundItems = useGameStore((state) => state.foundItems);
    const setFoundItems = useGameStore((state) => state.setFoundItems);

    const items: string[] = [
        "Fork", "Headphones", "Mug", "Remote", "Toothbrush"
    ];

    const [time, setTime] = useState<number>(0);

    useEffect(() => {
        if (foundItems >= 5) {
            setFoundItems(0);
            setGameState("gameover");        
        }
    }, [foundItems, setFoundItems, setGameState]);

    useEffect(() => {
        let timer: number | null = null;
        
        const runTimer = () => {
            setTime(prevTime => prevTime +1);
            timer = window.setTimeout(runTimer, 1000);
        };

        if (gameState === "playing") { 
            setTime(0);
            runTimer();
        }

        return () => {
            if (timer !== null) window.clearTimeout(timer)
        };
    }, [gameState]);

    if (!canvasReady || currentMediaType === null || activeDetectionLoop === null) {
        return <ReactModal>Uhmm try refreshing? not all states are set correctly</ReactModal>
    }

    return (
        <div className="game-container">
            {gameState === "playing" ? (
                <div>
                    <h1>Time: {time}</h1>
                    <h1>Find: {items[foundItems] || "Scavenge Complete!"}</h1>
                </div>
            ) : (
                <div>Game not started</div>
            )}
        </div>
    )
};

export default ScavengerGame;