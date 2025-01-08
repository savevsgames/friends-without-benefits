import { create } from "zustand";
import { persist } from "zustand/middleware"; // this is a zustand middleware to persist login throughout the app
import AuthService from "./utils/auth.ts";
import Peer from "peerjs";
// import { Socket } from "socket.io-client";
import io from "socket.io-client";
type SocketIOClient = ReturnType<typeof io>;

// Player extends UserData type with additional game-related properties
export interface Player extends UserData {
  score: number; // Player's current game score
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

interface Prediction {
  bbox: [number, number, number, number];
  class: string;
  score: number;
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
  gameState: "setup" | "countdown" | "playing" | "complete";
  canvasReady: boolean; // Flag to indicate if the canvas is ready for drawing
  videoPlaying: boolean; // Flag to indicate if the video is playing
  currentMediaRef: string | null; // Reference to the current media (URL or ID)
  currentMediaType: "image" | "video" | "webcam" | null;
  activeDetectionLoop: number | null; // Active detection loop ID
  isSingle: boolean;
  isMulti: boolean;
  numFoundItems: number; // 0-5
  itemsArr: string[]; // items to find
  foundItemsArr: string[] | null; // Arr to display to users as they find items
  timeRemaining: number; // Time in seconds
  countdown: number | null; // Countdown in seconds
  timerId: number | null; // Store timer ID
  detectMeter: number; // Used for progressbar
  currentDetections: Prediction[]; // Used to draw bbox and progressbar

  gameRoom: string | null; // Game ID from db

  isGameOver: boolean;

  // State Setters
  setGameState: (
    newState: "setup" | "countdown" | "playing" | "complete"
  ) => void;
  setCanvasReady: (ready: boolean) => void;
  setVideoPlaying: (playing: boolean) => void;
  setCurrentMediaRef: (ref: string | null) => void;
  setCurrentMediaType: (type: "image" | "video" | "webcam" | null) => void;
  setActiveDetectionLoop: (iteration: number | null) => void;
  setIsSingle: (value: boolean) => void;
  setIsMulti: (value: boolean) => void;
  setNumFoundItems: (numberFound: number) => void;
  setFoundItemsArr: (index: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  setDetectMeter: (value: number) => void;
  setCurrentDetections: (predictions: Prediction[]) => void;
  setGameRoom: (gameId: string) => void;
  setCountdown: (countdown: number | null) => void;
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
  itemsArr: ["Headphones", "Mug", "Remote", "Spoon", "Sunglasses"],
  foundItemsArr: [],
  timeRemaining: 120,
  timerId: null,
  detectMeter: 0,
  currentDetections: [],
  gameRoom: null,
  countdown: null,
  isSingle: true,
  isMulti: false,

  get isGameOver() {
    const { numFoundItems, timeRemaining } = get();
    return numFoundItems === 5 || timeRemaining === 0;
  },
  setGameState: (newState) => set({ gameState: newState }),
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
  setNumFoundItems: (numberFound) => {
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
  setCountdown: (countdown: number | null) => set({ countdown }),
  setDetectMeter: (detectMeter: number) => set({ detectMeter }),
  setCurrentDetections: (predictions) =>
    set({ currentDetections: predictions }),
  setGameRoom: (gameId) => {
    set({ gameRoom: gameId });
  },
  startTimer: () => {
    const currentTimer = get().timerId;
    if (currentTimer !== null) {
      window.clearTimeout(currentTimer);
    }

    set({ timeRemaining: 120, gameState: "playing" });

    const intervalId = window.setInterval(() => {
      set((state) => {
        const newTime = state.timeRemaining - 1;

        if (newTime <= 1) {
          window.clearInterval(intervalId);
          return {
            ...state,
            timeRemaining: 0,
            gameState: "complete",
            timerId: null,
          };
          //   timeRemaining: 0,
          //   timerId: null,
          //   gameState: "complete",
          //   // numFoundItems: 0,
          //   // foundItemsArr: [],
          // };
        }
        // Since the interval is 1000ms (1 second), we can just subtract 1
        return { timeRemaining: state.timeRemaining - 1 };
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
        countdown: null,
      };
    });
  },
  setIsSingle: (value) => {
    set({ isSingle: value, isMulti: !value });
  },
  setIsMulti: (value) => {
    set({ isMulti: value, isSingle: !value });
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
// had to do it this way because of the way the decoded is being decoded.
interface UserData {
  _id: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  shortestRound: string;
  isAdmin: boolean;
}
interface User {
  data: UserData;
  iat?: number;
  exp?: number;
}

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
  isTimeForCountdown: boolean;
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
  setIsTimeForCountdown: (isTime: boolean) => void;
  setWebcamEnabled: (enabled: boolean) => void;
  setPlayerReady: (id: string, ready: boolean, gameId?: string) => void;
  updatePlayerReadyStates: (readyStates: Record<string, boolean>) => void;
  startCountdown: (countdown: number) => void;
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
  playerReadyStates: {},
  webcamEnabled: false,
  isTimeForCountdown: false,
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
    set((state) => {
      if (!id || !data) {
        console.error("❌ Invalid player data. ID or data is missing.");
        return state;
      }
      return {
        players: {
          ...state.players,
          [id]: { ...state.players[id], ...data }, // Merge new data with existing
        },
      };
    }),
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
  // TODO:
  // This setter can also be used to set more Player properties for the
  // multiplayer game like avatar, itemsFound, etc.
  setPlayerReady: (id: string, ready: boolean, gameId?: string) => {
    set((state) => ({
      players: {
        ...state.players,
        [id]: { ...state.players[id], isReady: ready },
      },
    }));
    const players = useMultiplayerStore.getState().players;
    console.log("✅ Zustand Players State Updated: ", players);

    const socket = useMultiplayerStore.getState().socket;
    if (socket && gameId) {
      console.log(
        "📤 Emitting playerReady event to server:",
        id,
        "Game ID:",
        gameId
      );
      socket.emit("playerReady", { userId: id, gameId });
    } else {
      console.error("❌ Socket or gameId is undefined in setPlayerReady");
    }
  },
  updatePlayerReadyStates: (readyStates: Record<string, boolean>) => {
    set((state) => {
      // Update the ready state for player with [id:string] sent from the server
      // when allPlayersReady is true => start the countdown
      const updatedPlayers = { ...state.players };
      for (const id in readyStates) {
        if (updatedPlayers[id]) {
          updatedPlayers[id].isReady = readyStates[id];
          console.log(
            `The id: ${id}. updated players object at "id" key: ${updatedPlayers[id]}. updated players ready state: ${updatedPlayers[id].isReady}`
          );
        } else {
          console.error(
            "Player not found in the updated players object.",
            id,
            updatedPlayers,
            useMultiplayerStore.getState().players
          );
        }
      }
      return { players: updatedPlayers };
    });
  },
  setIsTimeForCountdown: (isTime: boolean) => {
    console.log("🕛 Its time to start the countdown:", isTime);
  },
  // Countdown sync for multiplayer games
  startCountdown: (countdown: number) => {
    // Access the gameStore to set the countdown
    const setGameState = useGameStore.getState().setGameState;
    const setCountdown = useGameStore.getState().setCountdown;
    // This triggers the socket io listener in the server to
    setGameState("countdown");
    setCountdown(countdown);
  },
}));
