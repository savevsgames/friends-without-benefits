import React, { useEffect, useState } from "react";
import { useMultiplayerStore } from "@/store";
import { Peer } from "peerjs";
import io from "socket.io-client";

const MultiplayerConnectionManager: React.FC = () => {
  // Destructure Mutiplayer Store State
  const {
    setPeer,
    setSocket,
    setPlayerId,
    addPlayer,
    removePlayer,
    setRoomId,
    isHost,
    setIsHost,
    roomId,
  } = useMultiplayerStore();

  const [localPeerId, setLocalPeerId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");
  const [inputRoomId, setInputRoomId] = useState<string>("");

  useEffect(() => {
    // Initialize socket.io connection
    const socket = io("http://localhost:3001");
    setSocket(socket); // Save socket instance to store

    socket.on("connect", () => {
      console.log("Connected to socket.io server!");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket.io server!");
      setConnectionStatus("Disconnected");
    });

    // Initialize PeerJS connection for WebRTC signaling (same port/endpoint as socket.io / server)
    // Currently initializes without a peer ID, will be assigned one after connection (undefined)
    const peer = new Peer({
      host: "localhost",
      port: 3001,
      path: "/peerjs",
    });

    // When peer is initialized, update the store with the peerId and player ID and set connection status
    peer.on("open", (id) => {
      console.log("PeerJS connection established with ID:", id);
      setLocalPeerId(id);
      setPlayerId(id);
      setConnectionStatus("Connected");
    });

    // Log data when a peer connection is established
    peer.on("connection", (conn) => {
      console.log("Peer connection is incoming: ", conn.peer);
      conn.on("data", (data) => {
        console.log("Received data from peer: ", data);
      });
    });

    // Log when a peer connection is closed
    peer.on("close", () => {
      console.log("Peer connection is closed.");
      setConnectionStatus("Disconnected");
    });

    setPeer(peer); // Save peer instance to store

    return () => {
      // Cleanup function
      peer.destroy();
      socket.disconnect();
    };
  }, [setPeer, setSocket, setPlayerId]);

  const handleCreateRoom = () => {
    setRoomId(localPeerId || ""); // Use local peer ID as room ID
    setIsHost(true); // Set this client as the host
    console.log("Room created with ID:", localPeerId);
  };

  const handleJoinRoom = () => {
    if (!inputRoomId) {
      console.error("Please enter a room ID to join.");
      return;
    }
    const peer = useMultiplayerStore.getState().peer;
    if (!peer) {
      console.error("PeerJS connection not established.");
      return;
    }

    const conn = peer.connect(inputRoomId);
    conn.on("open", () => {
      console.log("Connected to room:", inputRoomId);
      conn.send("PeerJS Connection Established!");
    });
    conn.on("data", (data) => {
      console.log("Received data:", data);
    });
  };

  return (
    <div>
      <h3>🔗 MultiplayerConnectionManager 🔗</h3>
      <p>Connection Status: {connectionStatus}</p>
      <p>Local Peer ID: {localPeerId}</p>
      {isHost ? (
        <p>Room ID: {roomId}</p>
      ) : (
        <div>
          <p>input for room joining</p>
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      )}
      {isHost && <button onClick={handleCreateRoom}>Create Room</button>}
    </div>
  );
};
export default MultiplayerConnectionManager;
