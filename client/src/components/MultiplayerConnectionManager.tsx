import React, { useEffect, useState } from "react";
import { useGameStore, useMultiplayerStore } from "@/store";
import { Peer } from "peerjs";
import io from "socket.io-client";
// Repeatable functions to connect to Socket.IO and PeerJS
import { initializeSocket } from "@/utils/multiplayer-utils";
import { enableWebcam } from "@/utils/model-utils";
// import { initializePeer } from "@/utils/multiplayer-utils";

const MultiplayerConnectionManager: React.FC = () => {
  // Destructure Mutiplayer Store State
  const {
    setSocket,
    setPeer,
    setPlayerId,
    // isHost,
    setIsHost,
    roomId,
    setRoomId,
    isConnected,
    setIsConnected,
  } = useMultiplayerStore();

  // For setting webcam as media type
  const { setCurrentMediaType } = useGameStore();

  // Local State for inputRoomId because it is entered into an input field
  const [inputRoomId, setInputRoomId] = useState<string>("");

  useEffect(() => {
    // Initialize socket.io connection with POLLING first to avoid CORS and blocking issues and provide more compatibility and fallback
    const socketIo = io("http://localhost:3001", {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
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

    // Save socket instance to store when the socket responds to one of the events
    setSocket(socketIo);

    return () => {
      // Cleanup function to drop socket.io connection
      socketIo.disconnect();
    };
  }, [setSocket]);

  // Initialize PeerJS connection for WebRTC signaling (same port/endpoint as socket.io / server)
  // USING BUTTON CLICK TO TRIGGER CONNECTION
  // Currently initializes without a peer ID, will be assigned one after connection (undefined)

  const handlePeerJSInitialization = () => {
    // TODO: Check store first to see if peer exists? or disable button if peer exists?
    console.log("Initializing PeerJS connection...");

    const peerJs = new Peer({
      host: "localhost",
      port: 3001,
      path: "/peerjs",
    });

    // When peer is initialized, update the store with the peerId and player ID and set connection status
    peerJs.on("open", (id) => {
      console.log("PeerJS connection established with ID:", id);
      setPlayerId(id); // Save player ID to store
      setRoomId(id); // Set the room ID to the local peer ID
      setPeer(peerJs); // Save peer instance to store
    });

    // Log data when a peer connection is established
    peerJs.on("connection", (conn) => {
      console.log("Peer connection is incoming: ", conn.peer);
      setIsConnected(true);

      conn.on("data", (data) => {
        console.log("Received data from peer: ", data);
      });
    });

    peerJs.on("close", () => {
      console.log("Peer connection is closed.");
      peerJs.destroy();
    });

    peerJs.on("error", (err) => {
      console.error("PeerJS Error:", err);
      peerJs.destroy();
    });
  };

  const handleCreateMultiplayerRoom = () => {
    // Make sure the webcam is enabled before creating a room with shareMyStream property of TRUE!
    enableWebcam(true);
    setCurrentMediaType("webcam");
    // Create a multiplayer game
    if (!roomId) {
      console.error("❌ Room ID not found. Please initialize a room.");
      return;
    }
    setRoomId(roomId); // Set the room ID to the local peer ID
    setIsHost(true); // Set this client as the host
    console.log("🏠 Room Created. Room ID:", roomId);
  };

  const handleJoinMultiplayerRoom = () => {
    if (!inputRoomId) {
      console.error("❌ Please enter a Room ID.");
      return;
    }
    // get the peer instance from the multiplayer store
    const peer = useMultiplayerStore.getState().peer;
    if (!peer) {
      console.error("❌ PeerJS or Socket.IO not initialized.");
      return;
    }
    // Join the game using the room ID that was provided by the host
    const conn = peer.connect(inputRoomId);
    conn.on("open", () => {
      console.log("🔗 Connected to Room:", inputRoomId);
      conn.send("🎥 PeerJS Connection Established!");
      setIsConnected(true);
    });

    conn.on("data", (data) => {
      console.log("📥 Received data from host:", data);
    });

    conn.on("close", () => {
      console.log("🔌 Disconnected from Room:", inputRoomId);
      setIsConnected(false);
    });
  };

  // Cleanup
  const cleanupConnections = () => {
    const socket = useMultiplayerStore.getState().socket;
    const peer = useMultiplayerStore.getState().peer;
    if (socket) {
      socket.disconnect();
      console.log("🧹 Disconnected Socket.IO...");
    } else if (peer) {
      peer.destroy();
      console.log("🧹 Destroyed PeerJS...");
    } else {
      console.log("🧹 No connections to cleanup...");
    }
  };

  const handleSocketIOConnection = () => {
    const connectedStatus = useMultiplayerStore.getState().isConnected;
    if (connectedStatus) {
      console.error("Socket.IO connection already established.");
      return;
    }
    console.log("Initializing Socket.IO connection...");
    const socketIo = initializeSocket();
    setSocket(socketIo);
    console.log(
      "Socket.IO connection established: ",
      `✅ Socket ID: ${useMultiplayerStore.getState().socket?.id}`
    );
  };
  // Turns on the webcam when the connection is established for the challenger
  useEffect(() => {
    if (isConnected) {
      console.log("🎥 Enabling Webcam...");
      // Enable webcam and and allow game to start with "start game" type button for both players - isReady?
      enableWebcam();
      setCurrentMediaType("webcam");
    }
  }, [isConnected]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Multiplayer Connection Manager
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Reconnect to Socket.IO */}
        <button
          className="border btn"
          onClick={() => handleSocketIOConnection()}
          style={{ backgroundColor: "lightgray" }}
        >
          Re-connect to Socket.IO
        </button>

        {/* Cleanup Connections */}
        <button
          className="border btn"
          onClick={cleanupConnections}
          style={{ backgroundColor: "lightgray" }}
        >
          Cleanup Connections
        </button>

        {/* PeerJS Initialization */}
        <button className="border btn" onClick={handlePeerJSInitialization}>
          Initialize PeerJS
        </button>

        {/* Create Multiplayer Room */}
        <button className="border btn" onClick={handleCreateMultiplayerRoom}>
          Create Multiplayer Game
        </button>
      </div>
      <p>✅ Socket ID: {useMultiplayerStore.getState().socket?.id || "N/A"}</p>
      <p> 🆔 Peer ID: {useMultiplayerStore.getState().peer?.id || "N/A"}</p>
      {isConnected ? (
        <p>✅Connected to Room: {roomId}</p>
      ) : (
        <p>❌ Not Connected</p>
      )}
      {/* Join Multiplayer Room */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={inputRoomId}
          onChange={(e) => setInputRoomId(e.target.value)}
          className="border p-1"
        />
        <button className="border btn" onClick={handleJoinMultiplayerRoom}>
          Join Game
        </button>
      </div>
    </div>
  );
};
export default MultiplayerConnectionManager;
