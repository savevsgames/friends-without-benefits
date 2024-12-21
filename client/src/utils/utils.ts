export const loadImageToCanvas = async (file: File): Promise<void> => {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const imageElement = document.createElement("img");
    const canvasElement = document.getElementById(
      "canvas-main"
    ) as HTMLCanvasElement;
    if (!canvasElement) {
      console.log("Canvas element not found");
      return;
    }

    // Once the reader.onload event is triggered and file is read as a string
    imageElement.src = event.target?.result as string;
    imageElement.onload = () => {
      // Canvas needs to match image dimensions
      canvasElement.width = imageElement.naturalWidth;
      canvasElement.height = imageElement.naturalHeight;

      // Read the image and show it on the canvas then delete it to clean up memory
      const imgMat = window.cv.imread(imageElement);
      console.log("Image Mat: ", imgMat);
      window.cv.imshow("canvas-main", imgMat);
      imgMat.delete();
    };
  };
  // call the reader to read file
  console.log("File: ", file);
  reader.readAsDataURL(file);
};
