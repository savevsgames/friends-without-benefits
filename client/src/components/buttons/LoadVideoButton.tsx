import {
  loadVideoToHiddenVideoInput,
  loadHiddenVideoToCanvasAtInterval,
} from "@/utils/utils";
import { useRef } from "react";
import { useGameStore } from "@/store";

const LoadVideoButton = () => {
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const canvasReady = useGameStore((state) => state.canvasReady);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LoadVideoToCanvas is a utility function in utils.ts using cv
  const handleLoadVideo = async (file: File) => {
    await loadVideoToHiddenVideoInput(file);
    /**
     * @param interval: number - The interval in milliseconds to update the canvas
     */
    loadHiddenVideoToCanvasAtInterval(100);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentMediaRef(file.name);
      await handleLoadVideo(file);
      setCurrentMediaType("video");
    }
  };

  return (
    <div className="btn btn-primary">
      <button
        className="btn btn-primary"
        type="button"
        id="load-video"
        name="load-video"
        disabled={!canvasReady}
        onClick={handleButtonClick}
      >
        Load Video
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        id="video-file-input"
        name="video-file-input"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <video
        id="video-output"
        style={{ display: "none" }}
        playsInline
        muted
      ></video>
    </div>
  );
};
export default LoadVideoButton;
