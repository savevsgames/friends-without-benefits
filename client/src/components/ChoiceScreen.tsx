import ReactModal from "react-modal";
import StartGameButton from "./buttons/StartGameButton";
import LoadWebcamButton from "./buttons/LoadWebcamButton";
import MultiPlayerModal from "./MultiplayerModal";
import React, { useState } from "react";

// import { useGameStore } from "../store";

ReactModal.setAppElement("#root");

interface ChoiceScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTuto: () => void;
  onTurnOnCamera: () => void;
}

const ChoiceScreen: React.FC<ChoiceScreenProps> = ({
  isOpen,
  onClose,
  onStartTuto,
}) => {
  // Local Setter for showing the Multiplayer Modal
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

  // Modal Handler for multiplayer modal
  const handleOpenMPModal = () => {
    setShowMultiplayerModal(true);
    //🍁create a new game in the mongo db
    //  -set the game id to the response _id
    //🍁 set the gameRoom in the store and the inviteLink in the store
    //  - gameRoom should then be avail in the store
    //🍁 - start the game logic in the create MP game button
  };

  const handleCloseMPModal = () => {
    setShowMultiplayerModal(false);
  };

  // const singlePlayer = useGameStore((state) => state.isSingle);
  // const multiPlayer = useGameStore((state) => state.isMulti);
  // console.log(singlePlayer);
  // console.log(multiPlayer);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel="Choice Screen"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          padding: "2rem",
          maxWidth: "600px",
          borderRadius: "10px",
          overflow: "auto",
          zIndex: 1001,
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 1000,
        },
      }}
    >
      {/* start game */}

      <StartGameButton onClose={onClose} />
      {/* Multiplayer Modal Button */}
      <div className="flex flex-col items-center justify-center gap-6">
        <button
          onClick={handleOpenMPModal}
          className="card bg-teal-600 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full"
        >
          <h2 className="text-2xl font-bold mb-2">Multiplayer Manager</h2>
          <p className="text-sm text-gray-300">
            Playing with friends is always fun!
          </p>
        </button>
        <MultiPlayerModal
          isOpen={showMultiplayerModal}
          onClose={handleCloseMPModal}
        />

        {/* start tutorial */}
        <button
          onClick={onStartTuto}
          className="card bg-teal-100 text-teal-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full mb-7"
        >
          <h2 className="text-2xl font-bold mb-2">📘 Start Tutorial</h2>
          <p className="text-sm text-gray-600">
            Learn how to play before starting.
          </p>
        </button>

        {/* turn on Webcam */}
        <LoadWebcamButton />
      </div>
    </ReactModal>
  );
};

export default ChoiceScreen;
