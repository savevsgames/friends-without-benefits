import React, { useEffect } from "react";
import { useMultiplayerStore } from "@/store";
import { Peer } from "peerjs";
import io from "socket.io-client";

// Sets up the multiplayer connection using Socket.IO and PeerJS - used to be in the
// mulitplayer connection manager component, but now that the manager is a modal this must
// load in a higher level component that wont lose context
const MultiplayerInitializer: React.FC = () => {
  const {
    playerId,
    roomId,
    setRoomId,
    setSocket,
    setPeer,
    setPlayerId,
    setIsConnected,
  } = useMultiplayerStore();

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
      console.log("PeerJS connection established with ID:", id);

      setPlayerId(id); // Save player ID to store
      console.log("🆔 Player ID:", playerId);

      // Both players will have their own room ID until they
      // create a room OR join another player's room
      setRoomId(id); // Set the room ID to the local peer ID

      console.log("🏠 Room ID:", roomId);

      setPeer(peerJs); // Save peer instance to store
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
  }, [
    setSocket,
    setPeer,
    setPlayerId,
    setIsConnected,
    roomId,
    playerId,
    setRoomId,
  ]);

  return null;
};

export default MultiplayerInitializer;
