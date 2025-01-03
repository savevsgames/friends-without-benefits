import RunDetectionButton from "@/components/buttons/RunDetectionButton.tsx";

import LoadWebcamButton from "@/components/buttons/LoadWebcamButton.tsx";

export const ControlPanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  return (
    <div
      className="fixed top-5 left-80 z-50 flex gap-4 -translate-x-1/2 items-start z-1000"
      style={{
        pointerEvents: "auto", 
      }}
    >
      {/* Buttons */}
      <LoadWebcamButton />

      <RunDetectionButton />
      {/* <LoadImageButton /> */}
    </div>
  );
};

export default ControlPanel;
