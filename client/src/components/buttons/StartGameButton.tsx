import React, { useEffect } from "react";
import { useMultiplayerStore } from "@/store";
import { useGameStore } from "@/store";
import { enableWebcam, toggleWebcam } from "@/utils/model-utils";
import { runDetectionOnCurrentMedia } from "../../utils/custom-model-utils-2";
// import { stopDetection } from "../../utils/custom-model-utils-2";

const StartGameButton: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const playerId = useMultiplayerStore((state) => state.playerId) || "";
  const players = useMultiplayerStore((state) => state.players);
  const setPlayerReady = useMultiplayerStore((state) => state.setPlayerReady);

  const isReady = players[playerId]?.isReady || false;

  console.log("Button [StartGameButton] => isReady before click: ", isReady);

  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setVideoPlaying = useGameStore((state) => state.setVideoPlaying);
  const canvasReady = useGameStore((state) => state.canvasReady);
  const videoPlaying = useGameStore((state) => state.videoPlaying);
  const currentMediaType = useGameStore((state) => state.currentMediaType);
  const setGameSate = useGameStore((state) => state.setGameState);

  /***
   * On button click -> enables webcam if stream is available
   */
  const handleWebcamStart = async () => {
    try {
      console.log("Starting webcam...");
      console.log(
        "Number of players in the game: ",
        Object.keys(players).length
      );
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
      console.log(
        "Button [StartGameButton] => The webcam is :",
        useMultiplayerStore.getState().webcamEnabled
      );
      console.log("[StartGameButton] => Video playing state: ", videoPlaying);

      setPlayerReady(playerId!, !isReady);
      console.log("Button [StartGameButton] => isReady after click: ", isReady);

      if (isReady && videoPlaying && canvasReady) {
        console.log(
          "Player is ready to start the game.",
          "Starting countdown..."
        );
        setGameSate("countdown");
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
  };

  useEffect(() => {
    const conditionsMet = isReady && canvasReady && currentMediaType;

    const logConditions = () => {
      console.log("isReady: ", isReady);
      console.log("canvasReady: ", canvasReady);
      console.log("currentMediaType: ", currentMediaType);
    };
    if (conditionsMet) {
      runDetectionOnCurrentMedia();
    } else {
      logConditions();
    }
  }, [isReady, canvasReady, currentMediaType]);

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
        <p className="text-sm">Jump right into the action!</p>
      </button>
    </div>
  );
};

export default StartGameButton;
