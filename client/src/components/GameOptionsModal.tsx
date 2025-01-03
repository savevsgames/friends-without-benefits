import ReactModal from "react-modal";
import { useGameStore } from "@/store";
import { useState } from "react";

ReactModal.setAppElement("#root");

interface GameOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameOptionsModal: React.FC<GameOptionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const setIsSingle = useGameStore((state) => state.setIsSingle);
  const setIsMulti = useGameStore((state) => state.setIsMulti);
  const [hasConsented, setHasConsented] = useState(false); // State for consent

  const handleSelection = (mode: "single" | "multi") => {
    if (!hasConsented) {
      alert("You must provide consent to proceed!");
      return;
    }
    console.log("Selected game mode is", mode);
    if (mode === "single") {
      setIsSingle(true);
      setIsMulti(false);
    } else if (mode === "multi") {
      setIsMulti(true);
      setIsSingle(false);
    }
    onClose();
  };

  const handleConsentChange = () => {
    setHasConsented((prev) => !prev);
  };

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
            onClick={() => handleSelection("single")}
          >
            <p className="text-base font-semibold text-teal-900 whitespace-nowrap">
              Single-Player
            </p>
          </button>

          {/* MultiPlayer */}
          <button
            className="flex-1 border-2 border-neutral-500 p-2 rounded-md text-center transition-colors duration-300 hover:bg-neutral-100"
            onClick={() => handleSelection("multi")}
          >
            <p className="text-base font-semibold text-teal-900 whitespace-nowrap">
              Multi-Player
            </p>
          </button>
        </div>

        {/* Consent Checkbox */}
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={handleConsentChange}
              className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
            />
            <span className="text-sm">
              I consent to sharing my camera and acknowledge that the developers
              are not responsible for any content displayed.
            </span>
          </label>
        </div>

        {/* Warning Message */}
        <p className="font-normal text-xs mt-2">
          This will default to a single-player game if no option is selected!
        </p>

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
