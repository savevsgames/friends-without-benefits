import React from "react";
import { useMultiplayerStore } from "@/store";
import { useGameStore } from "@/store";
import { enableWebcam } from "@/utils/model-utils";

const StartGameButton = ({
  variant,
  onComplete,
}: {
  variant: "tuto" | "sidebar";
  onComplete?: () => void;
}) => {
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

  /***
   * On button click -> enables webcam if stream is available
   */
  const handleWebcamStart = async () => {
    console.log("Video Playing: ", videoPlaying); // false expected
    // webcamOn will be true if the webcam becomes available
    const webcamOn = await enableWebcam(Object.keys(players).length > 1);
    // players object contains all the Players in the game so we take the number of
    // keys/indexes to determine if the webcam needs to be shared (audio enabled)
    if (webcamOn && Object.keys(players).length === 1) {
      setCurrentMediaType("webcam");
      setCurrentMediaRef("webcam-stream");
      setVideoPlaying(true);
      console.log("Webcam is enabled and the context has been updated.");
    } else if (webcamOn && Object.keys(players).length > 1) {
      setCurrentMediaType("webcam");
      setCurrentMediaRef("webcam-stream");
      setVideoPlaying(true);
      console.log(
        "Webcam is enabled for sharing and the context has been updated."
      );
    } else {
      console.error("Failed to load webcam stream.");
      setCurrentMediaType(null);
      setCurrentMediaRef(null);
      setVideoPlaying(false);
      // TODO: Give the player a modal to try again (tutorial) or leave the game options
    } // end of if

    if (onComplete) onComplete();
    return webcamOn;
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
      setPlayerReady(playerId!, !isReady);
      console.log("Button [StartGameButton] => isReady after click: ", isReady);
    } catch (error) {
      console.error(
        "Failed to set player ready state in start button: ",
        error
      );
    }
  };

  const variantStyles = {
    tuto: "px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700",
    sidebar: "",
  };

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
        className={`${variantStyles[variant]}`}
      >
        {isReady ? "Waiting for other players..." : "I'm ready to go!"}
      </button>
    </div>
  );
};

export default StartGameButton;
