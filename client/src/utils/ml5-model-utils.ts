import { useGameStore } from "@/store";

export async function loadModel() {
  try {
    const objectDetector = await window.ml5.objectDetector("cocossd");
    window.myMl5Detector = objectDetector;
    console.log("ml5 COCO-SSD model loaded!");
  } catch (error) {
    console.error("Error loading ml5 model:", error);
  }
}

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
 * ML5 version of drawBoundingBoxes
 * Draws bounding boxes around detected objects on the media source.
 * @param predictions Array of predictions from the model
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const drawBoundingBoxes = (predictions: any): void => {
  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  const imageElement = document.getElementById(
    "image-output"
  ) as HTMLImageElement;
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  const context = canvasElement?.getContext("2d");

  if (!canvasElement || !context) return;

  const cv = window.cv;
  if (!cv) return;

  try {
    const currentMediaType = useGameStore.getState().currentMediaType;
    // Create one source element (img or video) based on the current media type
    const sourceElement =
      currentMediaType === "image" ? imageElement : videoElement;

    if (!sourceElement) return;

    // Get the actual dimensions of the source media
    const sourceWidth =
      currentMediaType === "image"
        ? imageElement.naturalWidth
        : videoElement.videoWidth;
    const sourceHeight =
      currentMediaType === "image"
        ? imageElement.naturalHeight
        : videoElement.videoHeight;

    // Set canvas to match source dimensions, not display dimensions
    canvasElement.width = sourceWidth;
    canvasElement.height = sourceHeight;
    console.log(
      "Canvas dimensions:",
      canvasElement.width,
      "x",
      canvasElement.height
    );

    // Create transparent Mat at source dimensions
    const dstMat = new cv.Mat(
      canvasElement.height,
      canvasElement.width,
      cv.CV_8UC4
    );
    dstMat.setTo(new cv.Scalar(0, 0, 0, 0));

    // Calculate scaling for Bounding Box dynamically based on source dimensions
    const minDimension = Math.min(canvasElement.height, canvasElement.width);
    const boxThickness = Math.max(2, Math.floor(minDimension * 0.003));
    const fontSize = Math.max(0.7, minDimension * 0.001);
    const labelHeight = 50;
    const textPadding = 10;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    predictions.forEach((prediction: any) => {
      // Map your existing properties to the ones the function expects
      prediction.bbox = [
        prediction.x,
        prediction.y,
        prediction.width,
        prediction.height,
      ];
      prediction.className = prediction.label;
      prediction.score = prediction.confidence;

      // const { bbox, class: className, score: confScore } = prediction;
      // Use raw coordinates from prediction - they're already in source dimensions
      const [x, y, width, height] = prediction.bbox;
      const className = prediction.className;
      const confScore = prediction.score;
      const color = colorForLabels(className);

      // Draw bounding box and label box
      cv.rectangle(
        dstMat,
        new cv.Point(x, y),
        new cv.Point(x + width, y + height),
        color,
        boxThickness
      );

      cv.rectangle(
        dstMat,
        new cv.Point(x, y - labelHeight),
        new cv.Point(x + width, y),
        color,
        -1
      );
      // Draw label text
      const text = `${className} ${Math.round(confScore * 100)}%`;
      cv.putText(
        dstMat,
        text,
        new cv.Point(x + textPadding, y - textPadding),
        cv.FONT_HERSHEY_DUPLEX,
        fontSize,
        new cv.Scalar(255, 255, 255, 255),
        Math.max(1, Math.floor(fontSize / 2))
      );
    });

    // Draw to canvas at source dimensions
    const imageData = new ImageData(dstMat.cols, dstMat.rows);
    const data = dstMat.data;
    // Swtich BGRA to RGBA
    for (let i = 0; i < data.length; i += 4) {
      imageData.data[i] = data[i + 2];
      imageData.data[i + 1] = data[i + 1];
      imageData.data[i + 2] = data[i];
      imageData.data[i + 3] = data[i + 3];
    }
    // console.log("Drawing boxes on canvas...", imageData);
    context.putImageData(imageData, 0, 0);
    console.log("Boxes drawn on canvas.");
    // Clean up
    dstMat.delete();
  } catch (error) {
    console.error("Error drawing boxes:", error);
  }
};

export async function runDetectionOnCurrentMedia() {
  const { currentMediaType, videoPlaying } = useGameStore.getState();
  const imageElement = document.getElementById(
    "image-output"
  ) as HTMLImageElement;
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  if (!canvasElement || !imageElement || !videoElement) {
    console.error("Failed to get canvas, image or video element.");
    return;
  }
  if (!window.myMl5Detector) {
    console.warn("No ml5 detector found. Did you call loadModel()?");
    return;
  }

  // IMAGE DETECTION
  if (currentMediaType === "image") {
    // Sync canvas dimensions with the image
    canvasElement.width = imageElement.naturalWidth;
    canvasElement.height = imageElement.naturalHeight;

    console.log(
      "Canvas dimensions:",
      canvasElement.width,
      "x",
      canvasElement.height
    );

    // Draw the image onto the canvas with context and run detection
    const context = canvasElement.getContext("2d");
    if (!context) {
      console.error("Failed to get canvas 2D context.");
      return;
    }

    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText("SCAVENGER HUNT 2025", 10, 30);
    // Draw the prediction bounding boxes
    const predictions = await window.myMl5Detector.detect(imageElement);
    console.log("Predictions:", predictions);
    drawBoundingBoxes(predictions);
    return;
  } else if (currentMediaType === "video" || currentMediaType === "webcam") {
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      console.error("Video dimensions not found.");
      return;
    }
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  }

  // VIDEO DETECTION = default (webcam is still treated as video for our ml5 model)
  const detectFrame = async () => {
    if (!window.myMl5Detector) {
      console.warn("No ml5 detector found in global scope.");
      return;
    }
    if (videoElement.paused || !videoPlaying) return;
    const predictions = await window.myMl5Detector.detect(videoElement);
    console.log("Predictions:", predictions);
    drawBoundingBoxes(predictions);
    requestAnimationFrame(detectFrame);
  };
  detectFrame();
}
