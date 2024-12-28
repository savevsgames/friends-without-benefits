import React, { useEffect, useState } from "react";
import { useMultiplayerStore } from "@/store";
import { Peer } from "peerjs";
import io from "socket.io-client";

const MultiplayerConnectionManager: React.FC = () => {
  // Destructure Mutiplayer Store State
  const {
    setSocket,
    setPeer,
    setPlayerId,
    isHost,
    setIsHost,
    roomId,
    setRoomId,
    // isConnected,
    setIsConnected,
  } = useMultiplayerStore();

  // Local States
  // eslint-disable-next-line
  const [socket, setLocalSocket] = useState<any | null>(null);
  const [peer, setLocalPeer] = useState<Peer | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");
  const [localPeerId, setLocalPeerId] = useState<string | null>(null);
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
      setLocalSocket(socketIo);
    });

    socketIo.on("disconnect", () => {
      console.log("❌ Socket.IO Disconnected");
    });

    socketIo.on("connect_error", (error: Error) => {
      console.error("❗ Socket.IO Connection Error:", error);
    });

    // Save socket instance to store when the socket responds to one of the events
    setLocalSocket(socketIo);
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
    if (peer) {
      console.error("PeerJS connection already established.");
      return;
    }

    console.log("Initializing PeerJS connection...");

    const peerJs = new Peer({
      host: "localhost",
      port: 3001,
      path: "/peerjs",
    });

    // When peer is initialized, update the store with the peerId and player ID and set connection status
    peerJs.on("open", (id) => {
      console.log("PeerJS connection established with ID:", id);
      setLocalPeerId(id);
      setPlayerId(id);
    });

    // Log data when a peer connection is established
    peerJs.on("connection", (conn) => {
      console.log("Peer connection is incoming: ", conn.peer);
      setLocalPeer(peerJs); // Save peer instance to local store
      setPeer(peerJs); // Save peer instance to Zustand store
      setConnectionStatus("Connected");
      setIsConnected(true);

      conn.on("data", (data) => {
        console.log("Received data from peer: ", data);
      });
    });

    // Log when a peer connection is closed
    peerJs.on("close", () => {
      console.log("Peer connection is closed.");
      setLocalPeerId(null); // React local state cleanup on disconnect - if connection comes back, the state will be updated
      setConnectionStatus("Disconnected");
      setIsConnected(false);
    });
  };

  const handleCreateMultiplayerRoom = () => {
    // Create a multiplayer game
    if (!peer || !socket) {
      console.error("❌ PeerJS or Socket.IO not initialized.");
      return;
    }
    setLocalPeerId(peer.id);
    setRoomId(localPeerId || ""); // Use local peer ID as room ID
    setIsHost(true); // Set this client as the host
    console.log("🏠 Room Created. Room ID:", localPeerId);
  };

  const handleJoinMultiplayerRoom = () => {
    if (!inputRoomId) {
      console.error("❌ Please enter a Room ID.");
      return;
    }

    if (!peer || !socket) {
      console.error("❌ PeerJS or Socket.IO not initialized.");
      return;
    }
    // Join the game using the room ID that was provided by the host
    const conn = peer.connect(inputRoomId);
    conn.on("open", () => {
      console.log("🔗 Connected to Room:", inputRoomId);
      conn.send("🎥 PeerJS Connection Established!");
    });

    conn.on("data", (data) => {
      console.log("📥 Received data from host:", data);
    });
  };

  // Cleanup
  const cleanupConnections = () => {
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
    if (socket) {
      console.error("Socket.IO connection already established.");
      return;
    }
    console.log("Initializing Socket.IO connection...");
    const socketIo = io("http://localhost:3001", {});
    socketIo.on("connect", () => {
      console.log("✅ Socket.IO Connected:", socketIo.id);
      setSocket(socketIo);
      setLocalSocket(socketIo);
    });
    socketIo.on("disconnect", () => {
      console.log("❌ Socket.IO Disconnected");
    });
    socketIo.on("connect_error", (error: Error) => {
      console.error("❗ Socket.IO Connection Error:", error);
    });
  };

  return (
    <div>
      <h3>🔗 Multiplayer Connection Manager</h3>
      <div className="grid grid-cols-2 gap-4">
        <button className="border btn" onClick={handleSocketIOConnection}>
          Re-connect to Socket.IO
        </button>
        <button className="border btn" onClick={cleanupConnections}>
          Cleanup Connections
        </button>
        {/* Step 1: Initialize Peer */}
        {!peer && (
          <button onClick={handlePeerJSInitialization}>
            Initialize PeerJS
          </button>
        )}

        {/* Step 2: Create Room */}
        {peer && isHost && (
          <button onClick={handleCreateMultiplayerRoom}>Create Room</button>
        )}

        {/* Step 3: Join Room aka not Host*/}
        {peer && !isHost && (
          <div>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
            />
            <button onClick={handleJoinMultiplayerRoom}>Join Room</button>
          </div>
        )}
      </div>
      <p>
        Socket ID: {socket?.id || "Not Connected"} | Peer ID:{" "}
        {peer?.id || "Not Connected"}
      </p>
    </div>
  );
};
export default MultiplayerConnectionManager;
