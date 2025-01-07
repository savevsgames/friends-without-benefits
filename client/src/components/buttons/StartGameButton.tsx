import React, { useEffect } from "react";
import { useMultiplayerStore } from "@/store";
import { useGameStore } from "@/store";
import { enableWebcam } from "@/utils/model-utils";
import { runDetectionOnCurrentMedia } from "../../utils/custom-model-utils-2";
// import { Player } from "@/store";
// import { stopDetection } from "../../utils/custom-model-utils-2";

import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../../utils/mutations";
import { useUserSession } from "@/store";

const StartGameButton: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const playerId = useMultiplayerStore((state) => state.playerId) || "";
  const setPlayerId = useMultiplayerStore((state) => state.setPlayerId);
  const players = useMultiplayerStore((state) => state.players);
  const setPlayerReady = useMultiplayerStore.getState().setPlayerReady;
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
  const setGameSate = useGameStore((state) => state.setGameState);

  const setIsSingle = useGameStore((state) => state.setIsSingle);
  const setIsMulti = useGameStore((state) => state.setIsMulti);
  // Access the create game mutation
  const [createGameMutation] = useMutation(CREATE_GAME);
  // state.user or state?
  const user = useUserSession((state) => state.user);
  const socket = useMultiplayerStore((state) => state.socket);
  // const setRoomId = useMultiplayerStore((state) => state.setRoomId);
  const setGameRoom = useGameStore((state) => state.setGameRoom);
  const gameRoom = useGameStore((state) => state.gameRoom);
  const setIsHost = useMultiplayerStore((state) => state.setIsHost);
  const addPlayer = useMultiplayerStore((state) => state.addPlayer);
  const setIsTimeForCountdown =
    useMultiplayerStore.getState().setIsTimeForCountdown;

  const isReady = useMultiplayerStore.getState().players[playerId]?.isReady;

  // SINGLE PLAYER VERSION
  const handleSinglePlayerGameCreation = async () => {
    try {
      if (!user) {
        console.log("There is no authorized user");
        return;
      }
      // Set the playerId in the store
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

      const response = await createGameMutation({
        variables: {
          input: {
            authorId: user.data._id,
            items: [], // TODO: might need to sync items here - can be done in updateGame instead
            challengerIds: [],
          },
        },
      });

      // get the new game data from the response
      const newGameData = await response.data?.createGame;
      console.log("Game created: ", newGameData);
      if (!newGameData) {
        console.error("No game was created/returned.");
        return;
      }

      const newGameId = String(newGameData._id).trim();
      console.log(`🛠️ Game ID Length: ${newGameId.length}`);
      // Set the gameId for the server/user link
      // const gameId = newGameData._id || "THISGAMEIDISAFALLBACK";
      console.log(
        `Host with user data: ${user} has created a game with id: `,
        newGameId
      );

      setIsTimeForCountdown(true);
      setGameRoom(newGameId);

      // Game Room does not set in time?
      // if (!gameId || !gameRoom) {
      //   console.error("Game ID or Game Room not set!");
      //   return;
      // }

      // Update the zustand store

      // setRoomId(gameId);
      console.log("Room ID === Game ID: ", gameRoom === newGameId);
      console.log("Game Room ID: ", gameRoom);
      console.log("Game ID: ", newGameId);
      setIsSingle(true);
      setIsMulti(false);
      setIsHost(true);
      // SETTING isReady - adding new logic to make sure number of players in game goes up when they start the game

      // ???? playerId ? setPlayerId
      addPlayer(user.data._id, {
        ...user.data,
        isReady: true,
        score: 0,
      });
      console.log(
        `Player with id: ${playerId} has been added to game with id: ${newGameId}.`
      );

      setPlayerReady(user.data._id, true, newGameId!);

      console.log(
        "Players in the game -> Zustand: ",
        useMultiplayerStore.getState().players
      );

      // Update the isReady
      setPlayerReady(user.data._id, true, newGameId!);
      const readyStates = { [user.data._id]: true };
      console.log("Updating player ready states: ", readyStates);
      updatePlayerReadyStates(readyStates);

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
        setGameSate("countdown");
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

  useEffect(() => {
    const isReady = useMultiplayerStore.getState().players[playerId]?.isReady;
    // const isReady = true;
    const conditionsMet = isReady && canvasReady && currentMediaType;

    const logConditions = () => {
      console.log(
        "isReady: ",
        isReady,
        "canvasReady: ",
        canvasReady,
        "currentMediaType: ",
        currentMediaType
      );
    };
    if (conditionsMet) {
      runDetectionOnCurrentMedia();
    } else {
      logConditions();
    }
  }, [canvasReady, currentMediaType, playerId]);

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
        className="card bg-teal-700 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full"
      >
        <h2 className="text-2xl font-bold mb-2">
          {isReady ? "Waiting for other players..." : "Start Game!"}
        </h2>
        <p className="text-sm text-gray-300">Start Single Player Game</p>
      </button>
    </div>
  );
};

export default StartGameButton;
