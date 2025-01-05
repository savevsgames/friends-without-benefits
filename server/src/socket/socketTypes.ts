import { Server as SocketIOServer, Socket } from "socket.io";

//  interface for socket-ids
export interface SocketConnection {
  socketConnection: (socket: Socket) => void;
}

// interface for game store updates
export interface GameStateUpdates {
  // Zustand store update function - choose store and pass updates with interface props
  // Ex. ("game", {canvasReady: true})
  store: "game" | "multiplayer";
  updates: Record<string, any>;
}

// interface for chat messages
export interface ChatMessage {
  sender: string;
  message: string;
}

// interface for back-end context (Map)
export interface ServerContext {
  io: SocketIOServer;
  connectedUsers: Map<string, string>;
  playerReadyStates: Record<string, boolean>;
  numCurrentActiveUsers: number;
}
