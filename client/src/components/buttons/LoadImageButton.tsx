import { loadImageToCanvas } from "@/utils/utils";
import { useRef } from "react";
import { useGameStore } from "@/store";

const setCurrentImageRef = useGameStore((state) => state.setCurrentImageRef);

const handleLoadImage = async (file: File) => {
  await loadImageToCanvas(file);
};

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setCurrentImageRef(file.name);
    await handleLoadImage(file);
  }
};

const LoadImageButton = () => {
  return (
    <div>
      <button
        className="btn btn-primary"
        type="button"
        id="load-image"
        name="load-image"
        onClick={(e) => {
          // Load image from file input
          const input = e.target as HTMLInputElement;
          if (input.files && input.files[0]) {
            handleLoadImage(input.files[0]);
          }
        }}
      >
        Load Image
      </button>
      <input
        ref="{fileInputRef}"
        type="file"
        accept="image/*"
        id="file-input"
        name="file-input"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};
export default LoadImageButton;
