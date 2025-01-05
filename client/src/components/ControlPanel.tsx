import RunDetectionButton from "@/components/buttons/RunDetectionButton.tsx";
import { useIsDetectionActive } from "@/hooks/useIsDetectionActive";
import { useGameStore } from "@/store";
import { useState, useEffect } from "react";

export const ControlPanel: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = () => {
  const isDetectionActive = useIsDetectionActive();
  const [flash, setFlash] = useState(false);
  const videoPlaying = useGameStore((state) => state.videoPlaying);

  // trigger the flash animation when the camera turns on
  useEffect(() => {
    if (videoPlaying) {
      setFlash(true);
    } else {
      setFlash(false);
    }
  }, [videoPlaying]);

  return (
    <div
      className="flex flex-col ml-3 absolute bottom-12 left-24 content-center z-50 gap-4 -translate-x-1/2 justify-center z-1000"
      style={{
        pointerEvents: "auto",
      }}
    >

      {/* detection status */}
      <div className="flex items-center justify-between  gap-2 px-1 py-2 rounded-full bg-teal-950 bg-opacity-75 text-xs text-white shadow dark:bg-gray-700 dark:text-gray-200 w-48 pointer-events-auto">
        <span>🕵️‍♂️ Detecting..</span>
        <span
          className="font-semibold truncate"
          style={{
            animation: flash ? "flash 2s linear infinite" : "none",
          }}
        >
          {isDetectionActive ? "Active 🟢" : "Inactive 🔴"}
        </span>
      </div>
    </div>
  );
};

export default ControlPanel;
