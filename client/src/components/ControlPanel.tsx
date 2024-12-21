import { Button } from "@chakra-ui/react";

interface ControlPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  return (
    <div
      {...props}
      className="bg-gray-100 shadow-lg rounded-lg p-4 text-teal-950 tracking-widest font-bold max-h-full overflow-auto"
    >
      {/* Header */}
      <h2 className="text-center text-xl sm:text-2xl mb-4">Control Panel</h2>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          "Play",
          "Pause",
          "Cam",
          "Quit",
          "Load Image",
          "Load Video",
          "Detect",
        ].map((label, i) => (
          <Button
            key={i}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold transition text-sm sm:text-base md:text-lg w-full"
            size="md"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
