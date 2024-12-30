import React, { useEffect } from "react";
import { useMultiplayerStore } from "@/store";
import { Peer } from "peerjs";
import io from "socket.io-client";

// Sets up the multiplayer connection using Socket.IO and PeerJS - used to be in the
// mulitplayer connection manager component, but now that the manager is a modal this must
// load in a higher level component that wont lose context
const MultiplayerInitializer: React.FC = () => {
  const { setSocket, setPeer, setPlayerId, setIsConnected } =
    useMultiplayerStore();

  useEffect(() => {
    const socketIo = io("http://localhost:3001", {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    socketIo.on("connect", () => {
      console.log("✅ Socket.IO Connected:", socketIo.id);
      setSocket(socketIo);
    });

    socketIo.on("disconnect", () => {
      console.log("❌ Socket.IO Disconnected");
    });

    socketIo.on("connect_error", (error: Error) => {
      console.error("❗ Socket.IO Connection Error:", error);
    });

    // Initialize PeerJS
    const peerJs = new Peer({
      host: "localhost",
      port: 3001,
      path: "/peerjs",
    });

    peerJs.on("open", (id) => {
      console.log("✅ PeerJS connected:", id);
      setPeer(peerJs);
      setPlayerId(id);
    });

    peerJs.on("connection", (conn) => {
      console.log("🔗 PeerJS Connection:", conn.peer);
      setIsConnected(true);
    });

    peerJs.on("close", () => {
      console.log("❌ PeerJS Connection closed");
    });

    peerJs.on("error", (err) => {
      console.error("❗ PeerJS Error:", err);
    });

    return () => {
      socketIo.disconnect();
      peerJs.destroy();
    };
  }, [setSocket, setPeer, setPlayerId, setIsConnected]);

  return null;
};

export default MultiplayerInitializer;
