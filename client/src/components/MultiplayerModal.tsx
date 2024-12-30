import React, { useState } from "react";
import ReactModal from "react-modal";
import MultiplayerConnectionManager from "./MultiplayerConnectionManager.tsx";

// Set the app element for accessibility
ReactModal.setAppElement("#root");

const MultiPlayerModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <h1 onClick={openModal} className="">
        Multiplayer Manager
      </h1>

      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Multiplayer Manager Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
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
        <MultiplayerConnectionManager />
      </ReactModal>
    </div>
  );
};

export default MultiPlayerModal;
