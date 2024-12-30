import { create } from "zustand";
import { persist } from "zustand/middleware"; // this is a zustand middleware to persist login throughout the app
import AuthService from "./utils/auth.ts";
import Peer from "peerjs";
import { Socket as SocketIOClient } from "socket.io-client";
import io from "socket.io-client";
// Dynamically infer the socket type from the io() function
type SocketIOClient = ReturnType<typeof io>;

// Player extends User type with additional game-related properties
interface Player {
  username: string; // Player username displayed in the game
  score: number; // Player's current game score
  avatar?: string; // Player avatar image URL
  isReady: boolean; // Player is ready to start the game (multiplayer checking function)
  // Need to add more relevant props like items to find, etc.
}

export interface IGameState {
  gameState: string; // "setup", "playing", "gameover"
  canvasReady: boolean; // Flag to indicate if the canvas is ready for drawing
  videoPlaying: boolean; // Flag to indicate if the video is playing
  currentMediaRef: string | null; // Reference to the current media (URL or ID)
  currentMediaType: "image" | "video" | "webcam" | null;
  players: Record<string, Player>; // Stores our user_id strings - Zustand/SocketIo Host: [id1, id2], Challenger: [id2, id1] - swapped order
  // State Setters
  setGameState: (newState: string) => void;
  setCanvasReady: (ready: boolean) => void;
  setVideoPlaying: (playing: boolean) => void;
  setCurrentMediaRef: (ref: string | null) => void;
  setCurrentMediaType: (type: "image" | "video" | "webcam" | null) => void;
  addPlayer: (id: string, player: Player) => void;

  // Socket IO / Zustand Actions to set opponent player state
  outgoingUpdate: (updates: Partial<IGameState>) => void;
  incomingUpdate: (updates: Partial<IGameState>) => void;
}

// Using set() to update the store state for key-value pairs
export const useGameStore = create<IGameState>((set) => ({
  gameState: "setup",
  canvasReady: false,
  videoPlaying: false,
  currentMediaRef: null,
  currentMediaType: null,
  players: {},
  setGameState: (newState) => set({ gameState: newState }),
  setCanvasReady: (ready) => set({ canvasReady: ready }),
  setVideoPlaying: (playing) => set({ videoPlaying: playing }),
  setCurrentMediaRef: (ref) => set({ currentMediaRef: ref }),
  setCurrentMediaType: (type) => set({ currentMediaType: type }),
  addPlayer: (id, player) =>
    set((state) => ({
      players: { ...state.players, [id]: player },
    })),

  removePlayer: (id: string) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _data, ...rest } = state.players;
      return { players: { ...rest } };
    }),
  // Local update and emit via Socket.IO to challenger
  outgoingUpdate: (updates) => {
    set((state) => ({ ...state, ...updates }));
    const socket = useMultiplayerStore.getState().socket;
    socket?.emit("stateUpdate", { store: "game", updates });
  },

  // Apply updates from Socket.IO
  incomingUpdate: (updates) => {
    set((state) => ({ ...state, ...updates }));
  },
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
        useUserSession.getState().clearUser();
      },
    }),
    {
      name: "userLoginStatus", // configures the persist middleware, name specifies the key under which the store's state will be saved in localstorage
    }
  )
);

type User = {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  friends: string[];
  createdAt: string;
  shortestRound: string;
};

type SessionState = {
  user: User | null;
  UserDataFromToken: () => void;
  clearUser: () => void;
};

export const useUserSession = create(
  persist<SessionState>(
    (set) => ({
      // our main state
      user: {
        id: "",
        username: "",
        email: "",
        password: "",
        avatar: "",
        friends: [],
        createdAt: "",
        shortestRound: "",
      },

      // action to retrieve user from token
      UserDataFromToken: () => {
        const token = AuthService.getToken();
        if (token) {
          const decodedUser = AuthService.getProfile() as User;
          set({ user: decodedUser });
        }
      },

      // action to cleat the user
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-session", // the key used in localStorage to store the session
    }
  )
);

// define a theme store
export interface ThemeStore {
  theme: string;
  toggleTheme: () => void;
}
export const useThemeStore = create(
  persist<ThemeStore>(
    (set) => ({
      theme: "light",
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        }));
      },
    }),
    { name: "theme" }
  )
);

// MULTI-PLAYER STORE
export interface IMultiplayerState {
  playerId: string | null; // Unique player identifier (from PeerJS)
  peer: Peer | null; // PeerJS instance for WebRTC connections
  socket: SocketIOClient | null; // Socket.IO connection
  players: Record<string, Player>; // Player connections and metadata
  roomId: string | null; // Current multiplayer room ID
  isConnected: boolean; // Connection state
  isHost: boolean; // Is this client the host?
  webcamEnabled: boolean; // Is the webcam enabled?
  chatMessages: { sender: string; message: string }[]; // Chat message history
  gameStartTime: number | null; // Track when the game starts
  inviteLink: string | null; // Generated invite link for a challenger
  setPlayerId: (id: string) => void;
  setPeer: (peer: Peer) => void;
  setSocket: (socket: SocketIOClient) => void;
  addPlayer: (id: string, data: Player) => void;
  removePlayer: (id: string) => void;
  setIsConnected: (connected: boolean) => void;
  setRoomId: (id: string) => void;
  setIsHost: (isHost: boolean) => void;
  setWebcamEnabled: (enabled: boolean) => void;
  addChatMessage: (message: { sender: string; message: string }) => void;
  setInviteLink: (link: string) => void;
  setGameStartTime: (time: number) => void;
  // Socket IO / Zustand Actions to set state/opponent player state
  outgoingUpdate: (updates: Partial<IMultiplayerState>) => void;
  incomingUpdate: (updates: Partial<IMultiplayerState>) => void;
}

export const useMultiplayerStore = create<IMultiplayerState>((set) => ({
  playerId: null,
  peer: null,
  socket: null,
  players: {},
  roomId: null,
  isConnected: false,
  isHost: false,
  webcamEnabled: false,
  chatMessages: [],
  gameStartTime: null,
  inviteLink: null,
  setPlayerId: (id) => set({ playerId: id }),
  setPeer: (peer) => set({ peer }),
  setSocket: (socket) => set({ socket }),
  addPlayer: (id, data) =>
    set((state) => ({
      players: { ...state.players, [id]: data },
    })),
  removePlayer: (id) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _data, ...rest } = state.players;

      return { players: { ...rest } };
    }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setRoomId: (id) => set({ roomId: id }),
  setIsHost: (isHost) => set({ isHost }),
  setWebcamEnabled: (enabled) => set({ webcamEnabled: enabled }),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setInviteLink: (link) => set({ inviteLink: link }),
  setGameStartTime: (time) => set({ gameStartTime: time }),
  outgoingUpdate: (updates) => {
    set((state) => ({ ...state, ...updates }));
    const socket = useMultiplayerStore.getState().socket;
    socket?.emit("stateUpdate", { store: "multiplayer", updates });
  },
  incomingUpdate: (updates) => {
    set((state) => ({ ...state, ...updates }));
  },
}));
