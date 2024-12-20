import { create } from "zustand";

interface IGameState {
  gameState: string; // "setup", "playing", "gameover"
  canvasReady: boolean;
  videoPlaying: boolean;
  currentMediaRef: string | null; // Reference to the current media (URL or ID)
  currentMediaType: string | null; // Type of media (image, video, etc.)
  players: string[]; // Stores our user_id strings for player(s)
  // State Setters
  setGameState: (newState: string) => void;
  setCanvasReady: (ready: boolean) => void;
  setVideoPlaying: (playing: boolean) => void;
  setCurrentMediaRef: (ref: string) => void;
  setCurrentMediaType: (type: string) => void;
  addPlayer: (player: string) => void;
}

// Using set() to update the store state for key-value pairs
export const useGameStore = create<IGameState>((set) => ({
  gameState: "setup",
  canvasReady: false,
  videoPlaying: false,
  currentMediaRef: null,
  currentMediaType: null,
  players: [],
  setGameState: (newState) => set({ gameState: newState }),
  setCanvasReady: (ready) => set({ canvasReady: ready }),
  setVideoPlaying: (playing) => set({ videoPlaying: playing }),
  setCurrentMediaRef: (ref) => set({ currentMediaRef: ref }),
  setCurrentMediaType: (type) => set({ currentMediaType: type }),
  addPlayer: (player) =>
    set((state) => ({ players: [...state.players, player] })),
}));
