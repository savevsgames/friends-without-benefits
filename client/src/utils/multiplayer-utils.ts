import io from "socket.io-client";
import { Peer } from "peerjs";

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = () => {
  const socketIo = io("http://localhost:3001", {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
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

