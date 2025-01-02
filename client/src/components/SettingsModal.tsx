import React from "react";
import ReactModal from "react-modal";

ReactModal.setAppElement('#root')

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose}) => {
    return (
      <div>
        <ReactModal
          isOpen={isOpen}
          onRequestClose={onClose}
          contentLabel="SettingsModal"
          style={{
            content: {
              top: "30%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "1rem",
              maxWidth: "800px",
              borderRadius: "0.5rem", // Slight rounded corners
            },
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              zIndex: 1000,
            },
          }}
        >
          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-6">This could be anything: tutorial for different games maybe? so it's accessible throughout all pages on here</h2>
        </ReactModal>
      </div>
    );
}

export default SettingsModal;
