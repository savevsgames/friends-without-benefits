import { create } from "zustand";
import { persist } from "zustand/middleware"; // this is a zustand middleware to persist login throughout the app
import AuthService from "./utils/auth.ts";
import Peer from "peerjs";
// import { Socket } from "socket.io-client";
import io from "socket.io-client";
type SocketIOClient = ReturnType<typeof io>;

// Player extends User type with additional game-related properties
interface Player {
  username: string; // Player username displayed in the game
  score: number; // Player's current game score
  avatar?: string; // Player avatar image URL
  isReady: boolean; // Player is ready to start the game (multiplayer checking function)
  // Need to add more relevant props like items to find, etc.
}

// MODEL STORE
interface IModelState {
  isLoading: boolean;
  error: Error | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any | null;
  // Setters
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setModel: (model: any | null) => void;
}

export const useModelStore = create<IModelState>((set) => ({
  isLoading: false,
  error: null,
  model: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setModel: (model) => set({ model }),
}));

// GAME STORE - SINGLE & MULTIPLAYER
export interface IGameState {
  gameState: string; // "setup", "playing", "gameover"
  canvasReady: boolean; // Flag to indicate if the canvas is ready for drawing
  videoPlaying: boolean; // Flag to indicate if the video is playing
  currentMediaRef: string | null; // Reference to the current media (URL or ID)
  currentMediaType: "image" | "video" | "webcam" | null;
  activeDetectionLoop: number | null; // Active detection loop ID
  players: Record<string, Player>; // Stores our user_id strings - Zustand/SocketIo Host: [id1, id2], Challenger: [id2, id1] - swapped order
  numFoundItems: number; // 0-5 
  itemsArr: string[], // items to find
  foundItemsArr: string[] | null, // Arr to display to users as they find items 
  timeRemaining: number, // Time in seconds
  timerId: number | null // Store timer ID

  // State Setters
  setGameState: (newState: string) => void;
  setCanvasReady: (ready: boolean) => void;
  setVideoPlaying: (playing: boolean) => void;
  setCurrentMediaRef: (ref: string | null) => void;
  setCurrentMediaType: (type: "image" | "video" | "webcam" | null) => void;
  setActiveDetectionLoop: (iteration: number | null) => void;
  addPlayer: (id: string, player: Player) => void;
  setNumFoundItems: (numberFound: number) => void;
  setFoundItemsArr: (index: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetGame: () => void;

  // Socket IO / Zustand Actions to set opponent player state
  outgoingUpdate: (updates: Partial<IGameState>) => void;
  incomingUpdate: (updates: Partial<IGameState>) => void;
}

// Using set() to update the store state for key-value pairs
export const useGameStore = create<IGameState>((set, get) => ({
  gameState: "setup",
  canvasReady: false,
  videoPlaying: false,
  currentMediaRef: null,
  currentMediaType: null,
  activeDetectionLoop: null,
  numFoundItems: 0,
  itemsArr: ["Fork", "Headphones", "Mug", "Remote", "Toothbrush"],
  foundItemsArr:[],
  timeRemaining: 120,
  timerId: null,
  players: {},
  setGameState: (newState) => {
    set({ gameState: newState });
  },
  setCanvasReady: (ready) => {
    set({ canvasReady: ready });
  },
  setVideoPlaying: (playing) => {
    set({ videoPlaying: playing });
  },
  setCurrentMediaRef: (ref) => {
    set({ currentMediaRef: ref });
  },
  setCurrentMediaType: (type) => {
    set({ currentMediaType: type });
  },
  setActiveDetectionLoop: (iteration) => {
    set({ activeDetectionLoop: iteration });
  },
  setNumFoundItems: (numberFound)  => {
    set({ numFoundItems: numberFound });
  },
  setFoundItemsArr: (index) => {
    set((state) => {
      const newArr = [...(state.foundItemsArr || []), state.itemsArr[index]];
      if (newArr.length === 5) {
        return { foundItemsArr: [] };
      }
      return { foundItemsArr: newArr };
    });  
  },
  startTimer: () => {
    const currentTimer = get().timerId;
    if(currentTimer !== null) {
        window.clearTimeout(currentTimer);
    }

    set({ timeRemaining: 120 });
    
    const intervalId = window.setInterval(() => {
        set((state) => {
            const newTime = state.timeRemaining - 1;
            
            if (newTime <= 0) {
                
                window.clearInterval(intervalId);
                return {
                    timeRemaining: 0,
                    timerId: null,
                    gameState: "gameover",
                    numFoundItems: 0,
                    foundItemsArr: [],
                };
            }
            
            return { timeRemaining: newTime };
        });
    }, 1000);
    
    set({ timerId: intervalId });
},
  stopTimer: () => {
    set((state) => {
      if (state.timerId !== null) {
        window.clearTimeout(state.timerId);
      }
      return { timerId: null };
    });
  },
  resetGame: () => {
    set((state) => {
      if (state.timerId !== null) {
        window.clearTimeout(state.timerId);
      }
      return {
        timeRemaining: 120,
        timerId: null,
        gameState: "setup",
        numFoundItems: 0,
        foundItemsArr: [],
      }
    })
  },
  addPlayer: (id, player) => {
    set((state) => ({
      players: { ...state.players, [id]: player },
    }));
  },
  removePlayer: (id: string) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _data, ...rest } = state.players;
      return { players: { ...rest } };
    });
  },
  // Local update and emit via Socket.IO to challenger
  outgoingUpdate: (updates) => {
    set((state) => ({ ...state, ...updates }));
    const socket = useMultiplayerStore.getState().socket;
    socket?.emit("stateUpdate", { store: "game", updates });
    console.log("📤 Outgoing Game Store update:", updates);
  },
  // Apply updates from Socket.IO
  incomingUpdate: (updates) => {
    set((state) => ({ ...state, ...updates }));
    console.log("📥 Incoming Game Store update:", updates);
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
      user: null,

      // action to retrieve user from token
      UserDataFromToken: () => {
        const token = AuthService.getToken();
        if (token) {
          const decodedUser = AuthService.getProfile() as User;
          set({ user: decodedUser });
        }
      },

      // action to clear the user
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

// MULTI-PLAYER STORE - EXTENDS GAME STORE IN MULTIPLAYER MODE
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
  setPlayerId: (id) => {
    console.log("🆔 Player ID set in store:", id);
    set({ playerId: id });
  },
  setPeer: (peer) => {
    console.log("✅ PeerJS set in store");
    set({ peer });
  },
  setSocket: (socket) => {
    console.log("✅ Socket.IO set in store");
    set({ socket });
  },
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
  setIsConnected: (connected) => {
    console.log(`🔗 Connection status updated: ${connected}`);
    set({ isConnected: connected });
  },
  setRoomId: (id) => {
    console.log("🏠 Room ID set in store:", id);
    set({ roomId: id });
  },
  setIsHost: (isHost) => {
    console.log(`🎮 Host status updated: ${isHost}`);
    set({ isHost });
  },
  setWebcamEnabled: (enabled) => {
    console.log(`🎥 Webcam enabled: ${enabled}`);
    set({ webcamEnabled: enabled });
  },
  addChatMessage: (message) => {
    console.log("💬 Chat message added:", message);
    set((state) => ({ chatMessages: [...state.chatMessages, message] }));
  },
  setInviteLink: (link) => {
    console.log("🔗 Invite link generated:", link);
    set({ inviteLink: link });
  },
  setGameStartTime: (time) => {
    console.log("🕒 Game start time set:", time);
    set({ gameStartTime: time });
  },
  outgoingUpdate: (updates) => {
    set((state) => ({ ...state, ...updates }));
    const socket = useMultiplayerStore.getState().socket;
    socket?.emit("stateUpdate", { store: "multiplayer", updates });
    console.log("📤 Outgoing Multiplayer Store update:", updates);
  },
  incomingUpdate: (updates) => {
    set((state) => ({ ...state, ...updates }));
    console.log("📥 Incoming Multiplayer Store update:", updates);
  },
}));
