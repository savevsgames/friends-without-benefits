import io from "socket.io-client";
import { Peer } from "peerjs";
import { IGameState, useGameStore } from "@/store";
import { IMultiplayerState, useMultiplayerStore } from "@/store";

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = () => {
  const protocol: string = window.location.protocol;
  console.log("🔌 SOCKET-IO INITIALIZER Protocol:", protocol);
  // TODO: Add logic to handle secure connections
  const hostName: string = window.location.hostname;
  const socketIo = io(`http://${hostName}`, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    secure: false,
  });

  socketIo.on("connect", () => {
    console.log("✅ Socket.IO Connected:", socketIo.id);
  });

  socketIo.on("disconnect", () => {
    console.log("❌ Socket.IO Disconnected");
  });

  socketIo.on("connect_error", (error: Error) => {
    console.error("❗ Socket.IO Connection Error:", error);
  });

  return socketIo;
};

/**
 * Initialize PeerJS connection
 */
export const initializePeer = (): Peer => {
  const peer = new Peer({
    host: "localhost",
    port: 3001,
    path: "/peerjs",
    secure: false,
  });

  peer.on("open", (id) => {
    console.log("✅ PeerJS Connected. ID:", id);
  });

  peer.on("error", (err) => {
    console.error("❗ PeerJS Error:", err);
  });

  return peer;
};

type StoreUpdateData = {
  gameUpdates?: Partial<IGameState>;
  multiplayerUpdates?: Partial<IMultiplayerState>;
};

// Handles sending state updates to the server which will broadcast to all clients
export const sendStateUpdate = ({
  gameUpdates,
  multiplayerUpdates,
}: StoreUpdateData) => {
  const socket = useMultiplayerStore.getState().socket;

  if (!socket) {
    console.error("No socket connection");
    return;
  }
  socket.emit("storeUpdate", {
    gameUpdates,
    multiplayerUpdates,
  });

  if (gameUpdates) {
    console.log("Game State Updated:", gameUpdates);
    useGameStore.getState().outgoingUpdate(gameUpdates);
    socket.emit("gameStateUpdate", gameUpdates);
  }

  if (multiplayerUpdates) {
    console.log("Multiplayer State Updated:", multiplayerUpdates);
    useMultiplayerStore.getState().outgoingUpdate(multiplayerUpdates);
  }
};
