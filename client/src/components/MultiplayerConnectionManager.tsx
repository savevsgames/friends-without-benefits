import React, { useEffect, useState } from "react";
import { useGameStore, useMultiplayerStore, useUserSession } from "@/store";
import { Peer } from "peerjs";
// import io from "socket.io-client";
// Repeatable functions to connect to Socket.IO and PeerJS
import { initializeSocket } from "@/utils/multiplayer-utils";
import { enableWebcam } from "@/utils/model-utils";
// import { initializePeer } from "@/utils/multiplayer-utils";
import { IMultiplayerState } from "@/store";
import { IGameState } from "@/store";
import {
  FaSquareXTwitter,
  FaInstagram,
  FaSquareFacebook,
  FaSnapchat,
  FaLinkedin,
} from "react-icons/fa6";
import { Tooltip } from "react-tooltip";

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
  const adminUser = useUserSession((state) => state.user?.data.isAdmin);
  // Local State for inputRoomId because it is entered into an input field
  const [inputRoomId, setInputRoomId] = useState<string>("");

  // Initialize PeerJS connection for WebRTC signaling (same port/endpoint as socket.io / server)
  // USING BUTTON CLICK TO TRIGGER CONNECTION

  const handlePeerJSInitialization = () => {
    const { socket, playerId } = useMultiplayerStore.getState();
    if (!socket) {
      console.error("❌ Socket.IO connection not established.");
      return;
    }
    console.log("Initializing PeerJS connection...");

    // TODO: Check store first to see if peer exists? or disable button if peer exists?
    const hostName = window.location.hostname;
    const peerJs =
      useMultiplayerStore.getState().peer ||
      new Peer({
        host: hostName,
        port: 5173,
        path: "/peerjs",
      });
    // Make sure local scope syncs with store

    setPeer(peerJs);
    console.log("✅ PeerJS Connection established.");

    // When peer is initialized, update the store with the peerId and player ID and set connection status
    peerJs.on("open", (id) => {
      console.log("PeerJS connection established with ID:", id);

      setPlayerId(id); // Save player ID to store
      console.log("🆔 Player ID:", playerId);

      setRoomId(id); // Set the room ID to the local peer ID
      console.log("🏠 Room ID:", roomId);

      setPeer(peerJs); // Save peer instance to store
    });

    // Log data when a peer connection is established
    peerJs.on("connection", (conn) => {
      console.log("Peer connection is incoming: ", conn.peer);

      conn.on("data", (data) => {
        console.log("Received data from peer: ", data);
      });
    });

    peerJs.on("close", () => {
      console.log("Peer connection is closed.");
    });

    peerJs.on("error", (err) => {
      console.error("PeerJS Error:", err);
      // peerJs.destroy(); // because this is in a modal, we don't want to destroy the peer connection
    });
  };

  const handleCreateMultiplayerRoom = () => {
    // Make sure the webcam is enabled before creating a room with shareMyStream property of TRUE!
    enableWebcam();
    setCurrentMediaType("webcam");
    // Create a multiplayer game
    const peer = useMultiplayerStore.getState().peer;
    if (!peer) {
      console.error("❌ PeerJS is not initialized.");
      return;
    }

    if (!peer.id) {
      console.error("❌ PeerJS ID is not available yet. Try again.");
      return;
    }

    // Set the room ID and mark as Host
    setRoomId(peer.id);
    setIsHost(true);
    console.log("🏠 Room Created. Room ID:", peer.id);
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
      setRoomId(inputRoomId);
      // TODO:
      // We need a to sync the game state from the host to the challenger here.
      // Since the game state is created when start game is clicked
      // we need to sync the game state to the challenger when they join the room.
      // When we implement the start game button to add an entry to the db, we can
      // sync the zustand game state of the host to the challenger as well once the db is confirmed.
      // NOTE: Watch for conflicts before trying to sync the game state - im not sure if doing that
      // will cause issues with the store or db calls yet.
    });

    conn.on("data", (data) => {
      console.log("📥 Received data from host:", data);
    });

    conn.on("close", () => {
      console.log("🔌 Disconnected from Room:", inputRoomId);
      setIsConnected(false);
    });

    conn.on("error", (err) => {
      console.error("❗ Connection Error:", err.message);
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
  }, [isConnected, setCurrentMediaType, roomId, setRoomId]);

  useEffect(() => {
    const socket = useMultiplayerStore.getState().socket;

    if (!socket) {
      console.error("❌ Socket.IO connection not established.");
      return;
    }

    // Listen for state updates to either game or multiplayer store
    socket.on(
      "stateUpdate",
      ({
        store,
        updates,
      }: {
        store: "game" | "multiplayer";
        updates: Partial<IGameState | IMultiplayerState>;
      }) => {
        if (store === "game") {
          console.log(`🔄 Incoming GameStore Update (${store}):`, updates);
          useGameStore
            .getState()
            .incomingUpdate(updates as Partial<IGameState>);
        } else if (store === "multiplayer") {
          console.log(
            `🔄 Incoming MultiplayerStore Update (${store}):`,
            updates
          );
          useMultiplayerStore
            .getState()
            .incomingUpdate(updates as Partial<IMultiplayerState>);
        }
      }
    );

    // Listen for chat messages
    socket.on("chat-message", (data: { sender: string; message: string }) => {
      console.log("💬 Chat Message Received:", data);
      useMultiplayerStore.getState().addChatMessage(data);
    });

    return () => {
      socket.off("stateUpdate");
      socket.off("chat-message");
    };
  }, []);

  return (
    <div>
      {/* <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Multiplayer Connection Manager
      </h3> */}
      {adminUser && (
        <div className="grid grid-cols-2 gap-4">
          {/* PeerJS Initialization */}
          <button className="border btn" onClick={handlePeerJSInitialization}>
            Initialize PeerJS
          </button>
          {/* Cleanup Connections */}
          <button
            className="border btn"
            onClick={cleanupConnections}
            style={{ backgroundColor: "lightgray" }}
          >
            Cleanup Connections
          </button>
          {/* Reconnect to Socket.IO */}
          <button
            className="border btn"
            onClick={() => handleSocketIOConnection()}
            style={{ backgroundColor: "lightgray" }}
          >
            Re-connect to Socket.IO
          </button>
          <p>
            ✅ Socket ID: {useMultiplayerStore.getState().socket?.id || "N/A"}
          </p>
          <p> 🆔 Peer ID: {useMultiplayerStore.getState().peer?.id || "N/A"}</p>
          {isConnected ? (
            <p>✅Connected to Room: {roomId}</p>
          ) : (
            <p>❌ Not Connected</p>
          )}
        </div>
      )}
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold text-teal-700">Multiplayer Setup</h2>
        <p className="text-center text-gray-600">
          Choose to <span className="font-semibold">Create a Room</span> or{" "}
          <span className="font-semibold">Join an Existing Room</span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/******************** create room: create room + social ughhh *************************/}
          <div className="bg-teal-100 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">
              Create Room
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Start a multiplayer game and share the Room ID with others.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-3 justify-center">
                <FaSquareXTwitter size={26} />
                <FaInstagram size={26} />
                <FaSquareFacebook size={26} />
                <FaSnapchat size={26} />
                <FaLinkedin size={26} />
              </div>

              <button
                className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg hover:scale-105 transition-transform duration-300"
                onClick={handleCreateMultiplayerRoom}
                data-tooltip-id="create room"
              >
                <Tooltip
                  id="create room"
                  place="bottom-end"
                  className="font-thin text-xs "
                >
                  Click to copy Room Id and share it with friends!
                </Tooltip>
                Create Room
              </button>
            </div>
          </div>

          {/* **************** join room: input + join room ************* */}
          <div className="bg-teal-100 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">
              Join Room
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Enter the Room ID to join an existing multiplayer game.
            </p>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="border rounded-md p-2 w-full"
              />
              <button
                className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg hover:scale-105 transition-transform duration-300"
                onClick={handleJoinMultiplayerRoom}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MultiplayerConnectionManager;
