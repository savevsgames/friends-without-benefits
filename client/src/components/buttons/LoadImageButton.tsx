import { loadImageToCanvas } from "@/utils/utils";

const LoadImageButton = () => {
  const handleLoadImage = async (file: File) => {
    await loadImageToCanvas(file);
  };

  return (
    <button
      className="btn btn-primary"
      type="button"
      id="load-image"
      name="load-image"
      onClick={() => handleLoadImage}
    >
      Load Image
    </button>
  );
};
export default LoadImageButton;
