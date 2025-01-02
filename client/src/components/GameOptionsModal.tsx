import ReactModal from "react-modal";
import { useNavigate } from "react-router-dom";


ReactModal.setAppElement("#root");

interface GameOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameOptionsModal: React.FC<GameOptionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  return (
    <div>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="User Choices Modal"
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
        <h2 className="text-2xl font-bold text-center mb-6">Choose Wisely</h2>

        {/* Buttons container */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Single Player */}
          <button
            className="flex-1 border-2 border-neutral-500 p-2 rounded-md text-center transition-colors duration-300 hover:bg-neutral-100"
            onClick={() => navigate("/game")}
          >
            <p className="text-base font-semibold text-teal-900 whitespace-nowrap">
              Single-Player
            </p>
          </button>

          {/* MultiPlayer */}
          <button className="flex-1 border-2 border-neutral-500 p-2 rounded-md text-center transition-colors duration-300 hover:bg-neutral-100">
            <p className="text-base font-semibold text-teal-900 whitespace-nowrap">
              Multi-Player
            </p>
          </button>

          {/* Join Game */}
          <button className="flex-1 border-2 border-neutral-500 p-2 rounded-md text-center transition-colors duration-300 hover:bg-neutral-100">
            <p className="text-base font-semibold text-teal-900 whitespace-nowrap">
              Join Game
            </p>
          </button>
        </div>

        {/* Close button (aligned to the right) */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="border-2 border-gray-300 text-gray-700 px-4 py-1 rounded-md hover:bg-gray-200 transition-colors duration-300 text-xs"
          >
            Close
          </button>
        </div>
      </ReactModal>
    </div>
  );
};

export default GameOptionsModal;
