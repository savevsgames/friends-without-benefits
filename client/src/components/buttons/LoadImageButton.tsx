import { loadImageToCanvas } from "@/utils/utils";
import { useRef } from "react";
import { useGameStore } from "@/store";

const LoadImageButton = () => {
  const setCurrentMediaRef = useGameStore((state) => state.setCurrentMediaRef);
  const setCurrentMediaType = useGameStore(
    (state) => state.setCurrentMediaType
  );
  const canvasReady = useGameStore((state) => state.canvasReady);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // loadImageToCanvas is a utility function in utils.ts using cv
  const handleLoadImage = async (file: File) => {
    await loadImageToCanvas(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Once the file is selected with ref to the file input, set the reference to the current image and load it
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentMediaRef(file.name);
      await handleLoadImage(file);
      setCurrentMediaType("image");
    }
  };

  return (
    <div className="btn btn-primary">
      {/* disabled when canvas is not ready=true */}
      <button
        className="btn btn-primary"
        type="button"
        id="load-image"
        name="load-image"
        disabled={!canvasReady}
        onClick={handleButtonClick}
      >
        Load Image
      </button>
      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        id="image-file-input"
        name="image-file-input"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};
export default LoadImageButton;
