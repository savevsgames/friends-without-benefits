import React from "react";
import ReactModal from "react-modal";
import LoadWebcamButton from "./buttons/LoadWebcamButton";
import StartGameButton from "./buttons/StartGameButton";

interface TutorialModalProps {
  isOpen: boolean;
  content: string[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  isLastStep: boolean;
}

const TutoModal: React.FC<TutorialModalProps> = ({
  isOpen,
  content,
  currentStep,
  onNext,
  onSkip,
  isLastStep,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      contentLabel="tutorial modal"
      ariaHideApp={false}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          padding: "2rem",
          maxWidth: "500px",
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
      {/* tuto content */}
      <h2 className="text-xl font-bold mb-4">Kick-Off Time!</h2>
      <p className="mb-6">{content[currentStep]}</p>

      {/* tuto buttons: loadCam/ skip / next */}
      <div className="flex justify-between">
        {/* Shell div for StartGameButton */}
        <div onClick={onSkip}>
          <StartGameButton />
        </div>

        <LoadWebcamButton variant="tuto" />

        {currentStep === 1 ? ( // use webcam button
          <LoadWebcamButton onComplete={onNext} variant="tuto" />
        ) : (
          <button
            onClick={onNext}
            className={`px-4 py-2 ${
              isLastStep
                ? "bg-green-600 hover:bg-green-700"
                : "bg-teal-600 hover:bg-teal-700"
            } text-white rounded`}
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </ReactModal>
  );
};

export default TutoModal;
