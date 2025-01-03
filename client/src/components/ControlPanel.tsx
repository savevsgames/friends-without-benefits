import RunDetectionButton from "@/components/buttons/RunDetectionButton.tsx";

// import LoadWebcamButton from "@/components/buttons/LoadWebcamButton.tsx";

export const ControlPanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  
) => {
  return (
    <div
      className="absolute top-5 left-1/2 content-center z-50 flex gap-4 -translate-x-1/2 justify-center z-1000"
      style={{
        pointerEvents: "auto",
      }}
    >
      {/* Buttons */}
      {/* <LoadWebcamButton /> */}

      <RunDetectionButton />
      {/* <LoadImageButton /> */}
    </div>
  );
};

export default ControlPanel;
