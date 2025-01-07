import React from "react";
import ReactModal from "react-modal";
import MultiplayerConnectionManager from "./MultiplayerConnectionManager.tsx";

// Set the app element for accessibility
ReactModal.setAppElement("#root");

interface MultiPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultiPlayerModal: React.FC<MultiPlayerModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <div>
      <h1>Multiplayer Manager</h1>

      <ReactModal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Multiplayer Manager Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "2rem",
            maxWidth: "600px",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000,
          },
        }}
      >
        {/* Button to close the modal */}
        <button onClick={onClose} className="border p-2 rounded mb-4">
          Close
        </button>

        <h2 className="text-xl font-bold mb-4">Multiplayer Options</h2>
        {/* TODO: MultiplayerConnectionManager - child no longer controls isOpen*/}
        <MultiplayerConnectionManager />
      </ReactModal>
    </div>
  );
};

export default MultiPlayerModal;
