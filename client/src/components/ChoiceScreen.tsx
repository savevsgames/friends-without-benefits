import ReactModal from "react-modal";
import StartGameButton from "./buttons/StartGameButton";

const ChoiceScreen = ({
  isOpen,
  onClose,
  onStartTuto,

  onTurnOnCamera,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartTuto: () => void;

  onTurnOnCamera: () => void;
}) => {
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
      <div className="flex flex-col items-center justify-center gap-6">
        {/* start game */}
 
        <StartGameButton />

        {/* start tutorial */}
        <button
          onClick={onStartTuto}
          className="card bg-gray-800 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full"
        >
          <h2 className="text-2xl font-bold mb-2">📘 Start Tutorial</h2>
          <p className="text-sm">Learn how to play before starting.</p>
        </button>

        {/* turn on Webcam */}
        <button
          onClick={onTurnOnCamera}
          className="card bg-teal-600 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full"
        >
          <h2 className="text-2xl font-bold mb-2">📸 Turn on Webcam</h2>
          <p className="text-sm">Check your camera setup.</p>
        </button>
      </div>
    </ReactModal>
  );
};

export default ChoiceScreen;
