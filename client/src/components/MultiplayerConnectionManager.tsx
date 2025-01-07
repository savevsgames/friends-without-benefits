import React, { useEffect, useState } from "react";
import { useGameStore, useMultiplayerStore, useUserSession } from "@/store";
// import { Peer } from "peerjs";
// import io from "socket.io-client";
// Repeatable functions to connect to Socket.IO and PeerJS
// import { initializeSocket } from "@/utils/multiplayer-utils";
import { enableWebcam } from "@/utils/model-utils";
// import { initializePeer } from "@/utils/multiplayer-utils";

import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../utils/mutations";

import {
  FaSquareXTwitter,
  FaInstagram,
  FaSquareFacebook,
  FaSnapchat,
  FaLinkedin,
} from "react-icons/fa6";
import { Tooltip } from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";



const MultiplayerConnectionManager: React.FC = () => {
  // Destructure Mutiplayer Store State

  // const{ onGameCreation} = props.onGameCreation;

  const {
    playerId,
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
  const [copied, setCopied] = useState(false);
  // Local State for inputRoomId because it is entered into an input field
  const [inputRoomId, setInputRoomId] = useState<string>("");

  const isHost = useMultiplayerStore((state) => state.isHost);
  const isMulti = useGameStore((state) => state.isMulti);
  const setIsSingle = useGameStore((state) => state.setIsSingle);
  const setIsMulti = useGameStore((state) => state.setIsMulti);
  // Access the create game mutation
  const [createGameMutation] = useMutation(CREATE_GAME); // [createGameMutation, { loading, error }]
  // state.user or state?
  const user = useUserSession((state) => state.user);
  const socket = useMultiplayerStore((state) => state.socket);
  const setInviteLink = useMultiplayerStore((state) => state.setInviteLink);
  const inviteLink = useMultiplayerStore((state) => state.inviteLink);


  useEffect(() => {
    console.log("Room ID has been copied? ", copied);
  }, [copied]);

  const handleMultiplayerGameCreation = async () => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

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

    enableWebcam();
    setCurrentMediaType("webcam");

    try {
      const { data } = await createGameMutation({
        variables: {
          input: {
            authorId: user.data._id,
            challengerIds: [],
            items: [],
          },
        },
      });
      const newGame = data?.createGame;
      if (!newGame) {
        console.error("No game returned from createGame mutation");
        return;
      }

      // Register with the socket
      const gameId = newGame._id;
      if (socket) {
        socket.emit("registerUser", {
          userId: user.data._id,
          gameId,
        });
      }

      setPlayerId(user.data._id); // moved from the peerjs to user context
      setIsHost(true);
      setRoomId(gameId); // Set the room ID to the gameId
      setInviteLink(gameId);
      setIsMulti(true);
      setIsSingle(false);
      console.log(
        "🏠 Game Room Created: ",
        "Room ID:",
        gameId,
        "Multiplayer: ",
        isMulti,
        "You are the host: ",
        isHost,
        "Your PlayerId: ",
        playerId,

      );

      // onClose(); ?
    } catch (err) {
      console.error("Error creating multiplayer game:", err);
    }
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

  return (
    <div>
      {/* <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Multiplayer Connection Manager
      </h3> */}
      {adminUser && (
        <div className="grid grid-cols-2 gap-4">
          {/* PeerJS Initialization */}
          <button
            className="border btn"
            disabled={useMultiplayerStore.getState().peer !== null}
            // onClick={handlePeerJSInitialization}
          >
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
            disabled={useMultiplayerStore.getState().socket !== null}
            // onClick={() => handleSocketIOConnection()}
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
            <p className="text-sm text-gray-600 mb-8">
              Start a multiplayer game and share the Room ID with others.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-3 justify-center mb-2">
                <a href="https://x.com/?lang=en&mx=2" target="_blank">
                  <FaSquareXTwitter size={26} />
                </a>
                <a href="https://www.instagram.com/" target="_blank">
                  <FaInstagram size={26} />
                </a>
                <a href="https://www.facebook.com/" target="_blank">
                  <FaSquareFacebook size={26} />
                </a>
                <a href="https://www.snapchat.com/" target="_blank">
                  <FaSnapchat size={26} />
                </a>
                <a href="https://www.linkedin.com/" target="_blank">
                  {" "}
                  <FaLinkedin size={26} />
                </a>
              </div>
              <CopyToClipboard
                text={inviteLink || ""}
                onCopy={() => setCopied(true)}
              >
                <button
                  data-tooltip-id="create-room"
                  onClick={handleMultiplayerGameCreation}
                  className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg hover:scale-105 transition-transform duration-300"
                >
                  Create Game
                </button>
              </CopyToClipboard>

              <Tooltip
                id="create-room"
                place="bottom-end"
                className="font-thin text-xs"
              >
                Click to copy Room Id and share it with friends!
              </Tooltip>
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
