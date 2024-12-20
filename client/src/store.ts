import { create } from "zustand";

interface IGameState {
  gameState: string; // "setup", "playing", "gameover"
  canvasReady: boolean;
  players: string[]; // Stores our user_id strings for player(s)
  // State Setters
  setGameState: (newState: string) => void;
  setCanvasReady: (ready: boolean) => void;
  addPlayer: (player: string) => void;
}

// Using set() to update the store state for key-value pairs
export const useGameStore = create<IGameState>((set) => ({
  gameState: "setup",
  canvasReady: false,
  players: [],
  setGameState: (newState) => set({ gameState: newState }),
  setCanvasReady: (ready) => set({ canvasReady: ready }),
  addPlayer: (player) =>
    set((state) => ({ players: [...state.players, player] })),
}));
