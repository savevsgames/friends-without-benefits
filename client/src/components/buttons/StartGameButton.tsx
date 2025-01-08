import React, { useEffect, useState } from "react";
import { useMultiplayerStore } from "@/store";
import { useGameStore } from "@/store";
import { enableWebcam } from "@/utils/model-utils";
import { runDetectionOnCurrentMedia } from "../../utils/custom-model-utils-2";
// import { Player } from "@/store";
// import { stopDetection } from "../../utils/custom-model-utils-2";

import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../../utils/mutations";
import { useUserSession } from "@/store";

interface StartGameButtonProps {
  onClose?: () => void;
  onGameCreation?: (gameId: string) => void; //adding to pass the gameRoom to the canvas parent
}

const StartGameButton: React.FC<StartGameButtonProps> = ({
  onClose,
  onGameCreation,
}) => {
  const playerId = useMultiplayerStore((state) => state.playerId) || "";
  const setPlayerId = useMultiplayerStore((state) => state.setPlayerId);
  const players = useMultiplayerStore((state) => state.players);
  const setPlayerReady = useMultiplayerStore.getState().setPlayerReady;
  const [isLocalReady, setIsLocalReady] = useState<boolean>(false);
  const roomId = useMultiplayerStore((state) => state.roomId);
  // const startCountdown = useMultiplayerStore((state) => state.startCountdown);
  // const socket = useMultiplayerStore((state) => state.socket);
  const updatePlayerReadyStates = useMultiplayerStore(
    (state) => state.updatePlayerReadyStates
  );

  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const canvasReady = useGameStore((state) => state.canvasReady);
  const videoPlaying = useGameStore((state) => state.videoPlaying);
  const currentMediaType = useGameStore((state) => state.currentMediaType);
  // const setGameSate = useGameStore((state) => state.setGameState);

  const setIsSingle = useGameStore((state) => state.setIsSingle);
  const setIsMulti = useGameStore((state) => state.setIsMulti);
  // Access the create game mutation
  const [createGameMutation] = useMutation(CREATE_GAME);
  // state.user or state?
  const user = useUserSession((state) => state.user);
  const socket = useMultiplayerStore((state) => state.socket);
  // const setRoomId = useMultiplayerStore((state) => state.setRoomId);
  const setGameRoom = useGameStore((state) => state.setGameRoom);
  // const gameRoom = useGameStore((state) => state.gameRoom);
  const setIsHost = useMultiplayerStore((state) => state.setIsHost);
  const addPlayer = useMultiplayerStore((state) => state.addPlayer);

  const isReady = useMultiplayerStore.getState().players[playerId]?.isReady;

  // SINGLE PLAYER VERSION
  const handleSinglePlayerGameCreation = async () => {
    try {
      if (!user) {
        console.log("There is no authorized user");
        return;
      }
      //🍁 Set the playerId in the store
      setPlayerId(user.data._id);
      console.log("Player ID (playerId): ", playerId);
      console.log("playerId (user.data._id) : ", user.data._id);
      // console.log("User Data: ", user.data);
      // call the db with the mutation
      // console.log("Author ID:", user.data._id);
      // console.log("Items:", []);
      // console.log("Challenger IDs:", []);
      console.log("====================================");
      // console.log("Frontend User Context:", user.data);
      console.log("Author ID (sent in mutation):", user.data._id);
      // console.log("Token (if available):", localStorage.getItem("id_token"));

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
      setIsSingle(true);
      setIsMulti(false);
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
          gameType: "single",
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
      // the start game button is a child of the choice screen
      // which is a child of the Canvas.tsx which also holds the scavenger game logic
      // so we can pass the prop up instead of relying on Zustand
      if (onGameCreation) {
        onGameCreation(newGameId);
      }
      // close the modal
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.log("Error creating game in Choice Screen: ", error);
    }
  };

  /***
   * On button click -> enables webcam if stream is available
   */
  const handleWebcamStart = async () => {
    try {
      console.log("Starting webcam...");

      // webcamOn is the webcam stream object when it is first enabled
      const webcamOn = await enableWebcam();
      // players object contains all the Players in the game so we take the number of
      // keys/indexes to determine if the webcam needs to be shared (audio enabled)
      if (webcamOn) {
        setCurrentMediaType("webcam");
        setCurrentMediaRef("webcam-stream");
        setVideoPlaying(true);

        console.log(
          "Webcam is enabled and the SINGLE PLAYER GAME context has been updated."
        );
      } else {
        console.error("Failed to load webcam stream.");
        // setCurrentMediaType(null);
        // setCurrentMediaRef(null);
        // setVideoPlaying(false);
        // TODO: Give the player a modal to try again (tutorial) or leave the game options
      } // end of if
      console.log("Webcam stream object: ", webcamOn);
      console.log("Players in the game: ", players);
      console.log(
        "Number of players in the game: ",
        Object.keys(players).length
      );
      // Return the webcam stream object
      return webcamOn;
    } catch (error) {
      console.error("Failed to start webcam: ", error);
    }
  };

  const handleReadyClick = async () => {
    // PlayerId is guaranteed to be defined here in our app flow
    // This will go back to the store and update the players object:
    /**
     * players: {
        ...state.players,
        [id]: { ...state.players[id], isReady: ready },
      },
     */
    try {
      await handleWebcamStart();
      try {
        await handleSinglePlayerGameCreation();
        // setGameSate("countdown"); TODO: This is not needed here
      } catch (error) {
        console.error("Error Creating Game", error);
      }
      if (roomId) {
        setPlayerReady(playerId!, true, roomId);
        // console.log("Button [StartGameButton] => isReady after click: ", isReady);
      } else {
        console.error("ROOM ID NOT SET! - START BUTTON");
      }
      const isReady = useMultiplayerStore.getState().players[playerId]?.isReady;

      if (isReady && videoPlaying && canvasReady) {
        console.log(
          "Player is ready to start the game.",
          "Starting countdown..."
        );
        // TODO: DB Call for update game - start time etc.
        // THIS LEADS TO EMITTING THE COUNTDOWN > STORE > SERVER
      } else {
        console.log("Player is not ready to start the game.");
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error(
        "Failed to set player ready state in start button: ",
        error
      );
    }
    //setGameSate("playing");
  };

  // Attempt to Sync Zustand isReady with local isLocalReady state
  useEffect(() => {
    const ready = players[playerId]?.isReady ?? false;
    setIsLocalReady(ready);
  }, [players, playerId]);

  // Run detection when all conditions are met
  useEffect(() => {
    const conditionsMet = isLocalReady && canvasReady && currentMediaType;

    const logConditions = () => {
      console.log(
        "isLocalReady: ",
        isLocalReady,
        "canvasReady: ",
        canvasReady,
        "currentMediaType: ",
        currentMediaType
      );
    };

    if (conditionsMet) {
      console.log("✅ Conditions met. Starting detection...");
      runDetectionOnCurrentMedia();
    } else {
      logConditions();
    }
  }, [isLocalReady, canvasReady, currentMediaType]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        id="start-game-button"
        name="start-game-button"
        disabled={!canvasReady}
        onClick={handleReadyClick}
        className="card bg-teal-100 text-teal-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full mb-12"
      >
        <h2 className="text-2xl font-bold mb-2">
          {isReady ? "Waiting for other players..." : "Start Game!"}
        </h2>
        <p className="text-sm text-gray-600">Start Single Player Game</p>
      </button>
    </div>
  );
};

export default StartGameButton;
