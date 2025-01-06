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
    // TODO: Add DB call to createGame
    if (mode === "single") {
      setIsSingle(true);
      setIsMulti(false);
    } else if (mode === "multi") {
      setIsMulti(true);
      setIsSingle(false);
    }
    onClose();
  };

  const handleConsentChange = () => setHasConsented((prev) => !prev);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => {
        if (!hasConsented) {
          alert("You must provide consent to proceed!");
          return;
        }
        onClose();
      }}
      shouldCloseOnOverlayClick={hasConsented}
      contentLabel="User Choices Modal"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          padding: "1rem",
          maxWidth: "600px",
          borderRadius: "0.5rem",
          maxHeight: "80vh",
          overflow: "auto",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 1000,
        },
      }}
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-teal-800">
        Game Setup
      </h2>

      <div className="flex flex-col gap-4">
        <button
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 ${
            !hasConsented
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-teal-500 to-green-500 text-white hover:bg-teal-600"
          }`}
          onClick={() => handleSelection("single")}
          disabled={!hasConsented}
        >
          Single-Player
        </button>

        <button
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 ${
            !hasConsented
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-teal-500 to-green-500 text-white hover:bg-teal-600"
          }`}
          onClick={() => handleSelection("multi")}
          disabled={!hasConsented}
        >
          Multi-Player
        </button>
      </div>

      <div className="mt-6">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={hasConsented}
            onChange={handleConsentChange}
            className="form-checkbox h-5 w-5 text-teal-500 transition duration-150 ease-in-out"
          />
          <span className="text-sm">
            I agree to the terms (see details below)
          </span>
        </label>

        <div className="mt-4 bg-gray-100 border border-gray-300 p-4 rounded-lg overflow-y-auto max-h-48 text-sm text-gray-600">
          <p>
            <span className="font-medium">Webcam Use</span>: You consent to turn
            on your webcam during gameplay and in multiplayer sessions, you
            agree to share your webcam feed with other players.
          </p>
          <p className="mt-2">
            <span className="font-medium">No Recording or Monitoring</span>: We
            do not record or monitor any webcam activity. You are solely
            responsible for your interactions and behavior while using the
            webcam feature.
          </p>
          <p className="mt-2">
            <span className="font-medium">Behavioral Expectations</span>: You
            agree to conduct yourself in a civilized manner and not to offend or
            harass other players while on camera.
          </p>
          <p className="mt-2">
            <span className="font-medium">Liability Disclaimer</span>Liability
            Disclaimer: You understand that we are not liable for any issues or
            disputes that may arise from your webcam interactions.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (!hasConsented) {
              alert("You must provide consent to close the modal!");
              return;
            }
            onClose();
          }}
          className={`px-4 py-2 border rounded-md text-sm font-semibold ${
            !hasConsented
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          Close
        </button>
      </div>
    </ReactModal>
  );
};

export default GameOptionsModal;
