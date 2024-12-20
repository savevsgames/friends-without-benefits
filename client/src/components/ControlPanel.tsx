import { Button } from "@chakra-ui/react";

export const ControlPanel = () => {
  return (
    <div className="bg-gray-100 shadow-lg rounded-lg p-4 text-teal-950 tracking-widest font-bold">
      {/* Header */}
      <h2 className="text-center text-2xl mb-4">Control Panel</h2>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold transition"
          id="play_button"
          size="md"
        >
          Play
        </Button>
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold transition"
          id="pause_button"
          size="md"
        >
          Pause
        </Button>
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold transition"
          id="webcam_button"
          size="md"
        >
          Cam
        </Button>
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold transition"
          id="quit_button"
          size="md"
        >
          Quit
        </Button>
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold transition"
          id="load_image_button"
          size="md"
        >
          Load Image
        </Button>
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold transition"
          id="load_video_button"
          size="md"
        >
          Load Video
        </Button>
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold transition"
          id="detect_button"
          size="md"
        >
          Detect
        </Button>
      </div>
    </div>
  );
};
