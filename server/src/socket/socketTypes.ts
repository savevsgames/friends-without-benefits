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
  // Game id will be used for reconnection and match the mongoDB game _id
  gameId: string;
}

// interface for chat messages
export interface ChatMessage {
  sender: string;
  message: string;
  gameId: string;
}

// server context for each user's connection
export interface UserConnection {
  userId: string;
  socketId: string;
  peerId: string;
  gameId?: string;
  isHost: boolean;
  isReady: boolean;
}
// server context for each Game "Room"
export interface GameRoom {
  gameId: string;
  hostId: string;
  players: Map<string, UserConnection>;
  gameState: string;
  gameType: "single" | "multi"; // Adding game type so isReady can be simplified
}

// interface for back-end context (Map)
export interface ServerContext {
  io: SocketIOServer;
  numCurrentActiveUsers: number;
  userConnections: Map<string, UserConnection>;
  gameRooms: Map<string, GameRoom>;
}
