import React, { useState } from "react";
import ReactModal from "react-modal";
import MultiplayerConnectionManager from "./MultiplayerConnectionManager.tsx";

const MultiPlayerModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button onClick={openModal} className="border btn bg-teal-100">
        Open Multiplayer Manager
      </button>

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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 className="font-bold text-lg pb-1 text-center">
            Multiplayer Connection Manager
          </h2>
          <button onClick={closeModal} style={{ fontSize: "1.2rem" }}>
            X
          </button>
        </div>
        <hr className="pb-2" />
        <MultiplayerConnectionManager />
      </ReactModal>
    </div>
  );
};

export default MultiPlayerModal;
