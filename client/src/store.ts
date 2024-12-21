import { create } from "zustand";
import { persist } from "zustand/middleware"; // this is a zustand middleware to persist login throughout the app

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

// define AuthStore interface to describe the shape of the store from state and actions
interface AuthStore {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}
export const useAuthStore = create( // create: defines a store
  persist<AuthStore>(
    // set to update the store's state
    (set) => ({
      isLoggedIn: false,
      login: () => {
        const userLocalStorage = localStorage.getItem("Token");
        if (userLocalStorage) {
          set({ isLoggedIn: true });
        }
      },
      logout: () => {
        set({ isLoggedIn: false });
        localStorage.clear();
      },
    }),
    {
      name: "userLoginStatus", // configures the persist middleware, name specifies the key under which the store's state will be saved in localstorage
    }
  )
);
