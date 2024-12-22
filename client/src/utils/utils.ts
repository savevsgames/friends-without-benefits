// Note: Utility functions for the application
import { useGameStore } from "@/store";

/**
 * Load a given image file into the canvas.
 * @param file File object to load
 */
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

/**
 * Load a given video file into the canvas.
 * @param file File object to load
 */
export const loadVideoToCanvas = async (file: File): Promise<void> => {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const videoElement = document.createElement("video");
    const canvasElement = document.getElementById(
      "canvas-main"
    ) as HTMLCanvasElement;
    if (!canvasElement) {
      console.log("Canvas element not found");
      return;
    }

    // Once the reader.onload event is triggered and file is read as a string
    videoElement.src = event.target?.result as string;
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.onloadedmetadata = () => {
      // Canvas needs to match video dimensions
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      // Read the video and show it on the canvas then delete it to clean up memory
      const videoMat = window.cv.imread(videoElement);
      console.log("Video Mat: ", videoMat);
      window.cv.imshow("canvas-main", videoMat);
      videoMat.delete();
    };
  };
  // call the reader to read file
  console.log("File: ", file);
  reader.readAsDataURL(file);
};

/**
 * Enable the webcam
 * @param shareMyStream Flag to share the webcam stream for multiplayer games
 * @returns MediaStream object
 */
export const enableWebcam = async (
  shareMyStream = false
): Promise<MediaStream | null> => {
  try {
    const videoElement = document.getElementById(
      "canvas-main"
    ) as HTMLVideoElement;
    if (!videoElement) {
      console.error("Video element not found.");
      return null;
    }
    // Get the webcam stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    // Set the video element source to the stream
    videoElement.srcObject = stream;
    // Play the video
    videoElement.play();

    console.log("Webcam enabled:", videoElement.srcObject);

    if (shareMyStream) {
      console.log("Sharing webcam stream for multiplayer game...");
      //TODO: Add streaming logic here for peer.js
    }

    return stream;
  } catch (error) {
    console.error("Error enabling webcam:", error);
  }
  return null;
};

/**
 * Maps class names to specific colors for bounding boxes.
 * @param className Class name of the detected object
 * @returns RGBA color array
 */
export const colorForLabels = (className: string) => {
  const blue = [255, 0, 0, 255];
  const green = [0, 255, 0, 255];
  const red = [0, 0, 255, 255];
  const colors: { [key: string]: number[] } = {
    // Can add more colors to match the classes we want to detect
    person: blue,
    bottle: green,
    default: red,
  };
  //
  return colors[className] || colors.default;
};

/**
 * Draws bounding boxes around detected objects on the input image.
 * @param predictions Array of predictions from the model
 * @param inputImage Input image to draw bounding boxes on
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const drawBoundingBoxes = (predictions: any, inputImage: any) => {
  //   const canvas = document.getElementById("canvas-main");
  //   const context = canvas.getContext("2d");
  if (!window.cv) {
    console.log("OpenCV is not loaded. Cannot draw bounding boxes.");
    return;
  }
  const cv = window.cv;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predictions.forEach((prediction: any) => {
    const { bbox, class: className, score: confScore } = prediction;
    const [x, y, width, height] = bbox.map((val: number) => Math.round(val)); // Ensure all values are integers

    const color = colorForLabels(className);
    // Draw bounding box
    const point1 = new cv.Point(x, y);
    const point2 = new cv.Point(x + width, y + height);

    // Draw the bounding box
    cv.rectangle(inputImage, point1, point2, color, 8);
    // Draw the label background and text
    const text = `${className} ${Math.round(confScore * 100)}%`;
    const fontFace = cv.FONT_HERSHEY_SIMPLEX;
    const fontSize = 1; // Proportional size in rem
    const thickness = 1;
    const filled = -1; // Filled rectangle

    // Get text size for background rectangle
    // context.font = "20px Arial"; // Use to measure text width and height
    // const textMetrics = context.measureText(text);
    // const textWidth = textMetrics.width;
    const labelHeight = 50; // These are hardcoded for now
    const textPadding = 5;

    // Draw background rectangle for the label
    cv.rectangle(
      inputImage,
      new cv.Point(x, y - labelHeight),
      new cv.Point(x + width, y),
      color,
      filled
    );

    // Draw the text
    cv.putText(
      inputImage,
      text,
      new cv.Point(x + textPadding, y - textPadding), // Adjust text placement
      fontFace,
      fontSize,
      new cv.Scalar(255, 255, 255, 255), // White text
      thickness
    );
  });
};

/**
 * Run detection on the current media in the canvas.
 * Uses the store to access the current media type and video playing status.
 */
export const runDetectionOnCurrentMedia = async (): Promise<void> => {
  // Access the store for the current media type by name
  const { currentMediaType } = useGameStore.getState();

  if (!currentMediaType) {
    console.log(
      "Invalid media type or no media type selected. Cannot run detection."
    );
    return;
  }

  const cv = window.cv;
  const model = window.cocoSsd;
  if (!cv || !model) {
    console.log("OpenCV or model not loaded. Cannot run detection.");
    return;
  }

  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  if (!canvasElement) {
    console.error("Canvas element not found.");
    return;
  }

  // Process a single frame, grabbed from the canvas displaying the media
  try {
    const mediaMat = cv.imread(canvasElement);
    console.log(`${currentMediaType} Mat: `, mediaMat);

    const predictions = await model.detect(canvasElement);
    drawBoundingBoxes(predictions, mediaMat);

    cv.imshow("canvas-main", mediaMat);
    // clean the memory by deleting the Mat with the copy of the media data
    mediaMat.delete();

    // TODO:
    // Add GAME logic to process the predictions
    //

    if (
      (currentMediaType === "video" || currentMediaType === "webcam") &&
      // Check state of video playing
      useGameStore.getState().videoPlaying
    ) {
      // Process the next frame
      requestAnimationFrame(() => runDetectionOnCurrentMedia());
    } else {
      console.log(
        `Detection complete. ${currentMediaType} has been processed.`
      );
    }
  } catch (error) {
    console.error(`Error running detection on ${currentMediaType}:`, error);
  }
};
