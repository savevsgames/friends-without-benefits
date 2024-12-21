import { loadImageToCanvas } from "@/utils/utils";

const handleLoadImage = async (file: File) => {
  await loadImageToCanvas(file);
};

const LoadImageButton = () => {
  return (
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
  );
};
export default LoadImageButton;
