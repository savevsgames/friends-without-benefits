import { create } from "zustand";
import { persist } from "zustand/middleware"; // this is a zustand middleware to persist login throughout the app
import AuthService from "./utils/auth.ts";

interface IGameState {
  gameState: string; // "setup", "playing", "gameover"
  canvasReady: boolean;
  videoPlaying: boolean;
  currentMediaRef: string | null; // Reference to the current media (URL or ID)
  currentMediaType: ["image", "video", "webcam"] | null;
  players: string[]; // Stores our user_id strings for player(s)
  // State Setters
  setGameState: (newState: string) => void;
  setCanvasReady: (ready: boolean) => void;
  setVideoPlaying: (playing: boolean) => void;
  setCurrentMediaRef: (ref: string) => void;
  setCurrentMediaType: (type: ["image", "video", "webcam"]) => void;
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

// define AuthStore interface to describe the shape of the store from state and actions
interface AuthStore {
  isLoggedIn: boolean;
  login: (idToken: string) => void;
  logout: () => void;
}
export const useAuthStore = create(
  // create: defines a store
  persist<AuthStore>(
    // set to update the store's state
    (set) => ({
      isLoggedIn: AuthService.loggedIn(),

      login: (idToken) => {
        AuthService.login(idToken);
        set({ isLoggedIn: true });
      },

      logout: () => {
        set({ isLoggedIn: false });
        AuthService.logout();
      },
    }),
    {
      name: "userLoginStatus", // configures the persist middleware, name specifies the key under which the store's state will be saved in localstorage
    }
  )
);
