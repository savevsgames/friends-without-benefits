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

interface MultiplayerConnectionManagerProps {
  onClose?: () => void;
  onGameCreation?: (gameId: string) => void; //adding to pass the gameRoom to the canvas parent
}

const MultiplayerConnectionManager: React.FC<
  MultiplayerConnectionManagerProps
> = ({ onClose, onGameCreation }) => {
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

  // const isHost = useMultiplayerStore((state) => state.isHost);
  // const isMulti = useGameStore((state) => state.isMulti); // TODO: probably needed for conditional rendering
  const setIsSingle = useGameStore((state) => state.setIsSingle);
  const setIsMulti = useGameStore((state) => state.setIsMulti);
  // Access the create game mutation
  const [createGameMutation] = useMutation(CREATE_GAME); // [createGameMutation, { loading, error }]
  // state.user or state?
  const user = useUserSession((state) => state.user);
  const socket = useMultiplayerStore((state) => state.socket);
  const setInviteLink = useMultiplayerStore((state) => state.setInviteLink);
  const inviteLink = useMultiplayerStore((state) => state.inviteLink);
  const setGameRoom = useGameStore((state) => state.setGameRoom);
  const addPlayer = useMultiplayerStore((state) => state.addPlayer);
  const setPlayerReady = useMultiplayerStore((state) => state.setPlayerReady);
  const updatePlayerReadyStates = useMultiplayerStore(
    (state) => state.updatePlayerReadyStates
  );

  useEffect(() => {
    console.log("Invite Link changed: ", inviteLink);
  }, [inviteLink]);

  useEffect(() => {
    console.log("Room ID has been copied? ", copied);
  }, [copied]);

  const handleMultiplayerGameCreation = async () => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    setPlayerId(user.data._id); // moved from the peerjs to user context

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
      //🍁 Get the response from the db
      const response = await createGameMutation({
        variables: {
          input: {
            authorId: user.data._id,
            items: [], // TODO: might need to sync items here - can be done in updateGame instead
            challengerIds: [],
          },
        },
      });

      //🍁 get the new game data from the response
      const newGameData = await response.data?.createGame;
      console.log("Game created: ", newGameData);
      if (!newGameData) {
        console.error("No game was created/returned.");
        return;
      }

      const newGameId = String(newGameData._id).trim(); // ensuring no whitespace due to previous issues
      console.log(
        `Host with user data: ${user} has created a game with id: `,
        newGameId
      );

      //🍁 Zustand setters
      setGameRoom(newGameId);
      setInviteLink(newGameId);
      setIsSingle(false);
      setIsMulti(true);
      setIsHost(true);

      //🍁 Add the Player to useMultiplayerStore players
      addPlayer(user.data._id, {
        ...user.data,
        isReady: true,
        score: 0,
      });
      console.log(
        `Player with id: ${playerId} has been added to game with id: ${newGameId}.`
      );

      //🍁 REGISTER the player before emitting they are isReady
      // Emit to the server that a new user is registering (first register)
      if (!socket) {
        console.error("❌ No socket exists to broadcast new game.");
      } else {
        console.log("Emitting registerUser: ", user?.data._id, newGameId);
        socket.emit("registerUser", {
          userId: user?.data._id,
          gameId: newGameId,
          gameType: "multi",
        });
      }

      //🍁 Wait for the server to respond with a "userRegistered"
      if (!socket) {
        console.error("❌ No socket exists to broadcast new game.");
      } else {
        socket.once(
          "userRegistered",
          ({ success, message }: { success: string; message: string }) => {
            if (success) {
              console.log(
                "✅ User successfully registered on server:",
                message
              );

              // Now mark the player as ready
              setPlayerReady(user.data._id, true, newGameId);

              console.log("📤 Emitting playerReady to server...");
              socket.emit("playerReady", {
                userId: user.data._id,
                gameId: newGameId,
              });

              // Update Zustand
              updatePlayerReadyStates({ [user.data._id]: true });
              // setIsTimeForCountdown(true); // fall back trigger

              console.log(
                "🎯 Player is marked ready locally and on the server."
              );
            } else {
              console.error("❌ User registration failed:", message);
            }
          }
        );
      }
      // pass the gameRoom to the parent
      if (onGameCreation) {
        onGameCreation(newGameId);
      }
      // close the modal
      if (onClose) {
        onClose();
      }

      // onClose(); ?
    } catch (err) {
      console.error("Error creating multiplayer game:", err);
    }
  };

  const handleJoinMultiplayerRoom = () => {
    console.log("Joining Room:", inputRoomId);
    if (!user) {
      console.log("No user logged in");
      return;
    }
    if (!inputRoomId) {
      console.error("❌ Please enter a Room ID.");
      return;
    }
    if (!socket) {
      console.error("❌ Socket.IO not initialized.");
      return;
    }

    console.log("Input Room ID before setting states:", inputRoomId); // Log inputRoomId again
    setGameRoom(inputRoomId); // Explicitly set the gameRoom state
    setRoomId(inputRoomId); // Set the roomId state
    console.log("Game Room and Room ID after setting states:", {
      gameRoom: useGameStore.getState().gameRoom,
      roomId: useMultiplayerStore.getState().roomId,
    });

    // get the peer instance from the multiplayer store
    const peer = useMultiplayerStore.getState().peer;
    if (!peer) {
      console.error("❌ PeerJS or Socket.IO not initialized.");
      return;
    }
    console.log("PeerJS instance exists. PeerId: ", peer.id);
    // Join the game using the room ID that was provided by the host
    // Update Zustand Store State
    setRoomId(inputRoomId);
    setIsConnected(true);
    setGameRoom(inputRoomId); // Ensure the gameRoom is set in Zustand
    setIsMulti(true);
    setIsSingle(false);
    console.log("🆔 Room ID set in Zustand:", inputRoomId);

    // Emit 'registerUser' event to the server
    socket.emit("registerUser", {
      userId: user.data._id,
      gameId: inputRoomId,
      gameType: "multi",
    });

    // Listen for server confirmation
    socket.once(
      "userRegistered",
      ({ success, message }: { success: boolean; message: string }) => {
        if (success) {
          console.log(
            "✅ Challenger successfully registered on server:",
            message
          );

          // Mark Player as Ready
          setPlayerReady(user.data._id, true, inputRoomId);
          console.log("📤 Emitting playerReady to server...");

          socket.emit("playerReady", {
            userId: user.data._id,
            gameId: inputRoomId,
          });

          updatePlayerReadyStates({ [user.data._id]: true });

          console.log("🎯 Player is marked ready locally and on the server.");
        } else {
          console.error("❌ Challenger registration failed:", message);
        }
      }
    );

    // pass the gameRoom to the parent
    if (onGameCreation) {
      onGameCreation(inputRoomId);
    }
    // close the modal
    if (onClose) {
      onClose();
    }

    // TODO:
    // We need a to sync the game state from the host to the challenger here.
    // Since the game state is created when start game is clicked
    // we need to sync the game state to the challenger when they join the room.
    // When we implement the start game button to add an entry to the db, we can
    // sync the zustand game state of the host to the challenger as well once the db is confirmed.
    // NOTE: Watch for conflicts before trying to sync the game state - im not sure if doing that
    // will cause issues with the store or db calls yet.
  };

  useEffect(() => {
    const { roomId, players } = useMultiplayerStore.getState();
    const gameRoom = useGameStore.getState().gameRoom;
    console.log("🛠️ Zustand Debugging:");
    console.log("Room ID (Zustand):", roomId);
    console.log("Game Room (Zustand):", gameRoom);
    console.log("Players (Zustand):", players);
  }, [roomId]);

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
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "0.25rem",
                  margin: "0.25em 0.5rem",
                }}
              >
                LINK: {useMultiplayerStore.getState().inviteLink}
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
