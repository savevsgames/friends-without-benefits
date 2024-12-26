import LoadImageButton from "../components/buttons/LoadImageButton.tsx";
import RunDetectionButton from "@/components/buttons/RunDetectionButton.tsx";
import LoadVideoButton from "@/components/buttons/LoadVideoButton.tsx";
import LoadWebcamButton from "@/components/buttons/LoadWebcamButton.tsx";
import PlayStopVideoButton from "@/components/buttons/PlayStopVideoButton.tsx";
import PauseVideoButton from "@/components/buttons/PauseVideoButton.tsx";

interface ControlPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  return (
    <div
      {...props}
      className="bg-gray-100 shadow-lg rounded-lg p-4 text-teal-950 tracking-widest font-bold max-h-full overflow-auto"
    >
      {/* Header */}
      <h2 className="text-center text-xl sm:text-l mb-4">Control Panel</h2>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <LoadImageButton />
        <LoadVideoButton />
        <PlayStopVideoButton />
        <PauseVideoButton />
        <LoadWebcamButton />
        <RunDetectionButton />
      </div>
    </div>
  );
};
