// Note: Utility functions for the application
// import * as tf from "@tensorflow/tfjs";
import { useGameStore } from "@/store";
// import { useMultiplayerStore } from "@/store";

interface Prediction {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

// interface RawPredictions {
//   boxes: number[][][];
//   scores: number[][][];
//   classes: number[][][];
// }

// interface Model {
//   executeAsync: (input: HTMLVideoElement) => Promise<RawPredictions>;
// }

// interface DetectionCallback {
//   (predictions: Prediction[]): void;
// }

/**
 * Load the TF.js model from a given URL or local path.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const cvstfjs: any;
const { setFoundItems, foundItems } = useGameStore.getState();

export async function loadModel() {
  try {
    // We store the model as a global or module-level variable
    window.cvsModel = new cvstfjs.ObjectDetectionModel();
    await window.cvsModel.loadModelAsync("/models/tfjs/model.json");
    console.log("TF.js model loaded successfully!", window.cvsModel);
  } catch (error) {
    console.error("Error loading TF model:", error);
  }
}

/**
 * Get the loaded model or null if not loaded yet
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getModel(): any | null {
  if (window.cvsModel) {
    // Return the model if it's already loaded
    return window.cvsModel ?? null;
  }
  return null;
}

const YOLO_CLASSES: { [key: number]: string } = {
  0: "Fork",
  1: "Headphones",
  2: "Mug",
  3: "Remote",
  4: "Toothbrush",
};

/**
 * Convert raw model output [boxes, scores, classes]
 * from normalized coords -> pixel coords [x, y, w, h].
 *
 * Typically, boxes = [ [y1, x1, y2, x2], ... ] in normalized range [0..1].
 */
function formatPredictions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawPredictions: any[],
  videoElement: HTMLVideoElement,
  threshold = 0.15 // TODO: Make this configurable?
): Prediction[] {
  if (!rawPredictions || rawPredictions.length < 3) {
    console.warn("Raw predictions array is invalid.", rawPredictions);
    return [];
  }

  console.log("Raw predictions:", rawPredictions);
  // DEBUGGING INFO: ACTUAL OUTPUT FROM MODEL
  //   [
  //     [
  //         [
  //             0.21632200479507446,
  //             0.024378687143325806,
  //             0.758617103099823,
  //             0.9370595216751099
  //         ],
  //         [
  //             0.559609055519104,
  //             0.06952086091041565,
  //             1.0044176578521729,
  //             0.977522611618042
  //         ]
  //     ],
  //     [
  //         0.05153145641088486,
  //         0.015005435794591904
  //     ],
  //     [
  //         1,
  //         1
  //     ]
  // ]

  // Destructure arrays
  const [boxes, scores, classes] = rawPredictions;
  // boxes => [ [y1, x1, y2, x2], [y1, x1, y2, x2], ... ]
  // scores => [score1, score2, ...]
  // classes => [classIndex1, classIndex2, ...]
  if (!boxes.length || !scores.length || !classes.length) {
    console.warn("No valid detections found in the arrays.");
    return [];
  }

  // Actual video resolution
  const vidW = videoElement.videoWidth;
  const vidH = videoElement.videoHeight;

  const results: Prediction[] = [];

  // Loop over each detection
  for (let i = 0; i < boxes.length; i++) {
    const score = scores[i];
    if (score < threshold) continue; // skip below threshold

    // Each box is [y1, x1, y2, x2] in normalized coords
    const [x1, y1, x2, y2] = boxes[i];

    // Convert normalized coords => pixel coords
    const x = x1 * vidW;
    const y = y1 * vidH;
    const width = (x2 - x1) * vidW;
    const height = (y2 - y1) * vidH;

    const classIndex = classes[i];
    // e.g. YOLO_CLASSES: { 0: "Fork", 1: "Headphones", ... }
    const label = YOLO_CLASSES[classIndex] ?? "unknown";

    results.push({
      bbox: [x, y, width, height],
      class: label,
      score,
    });
  }

  return results;
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

export const drawBoundingBoxes = (predictions: Prediction[]): void => {
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
      const { bbox, class: className, score: confScore } = prediction;
      // Use raw coordinates from prediction - they're already in source dimensions
      const [x, y, width, height] = bbox.map((val: number) => val);
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
    for (let i = 0; i < data.length; i += 4) {
      imageData.data[i] = data[i + 2];
      imageData.data[i + 1] = data[i + 1];
      imageData.data[i + 2] = data[i];
      imageData.data[i + 3] = data[i + 3];
    }

    // 7. Draw final imageData to canvas
    context.putImageData(imageData, 0, 0);
    // Clean up
    dstMat.delete();
    console.log("Bounding boxes drawn on canvas!");
  } catch (error) {
    console.error("Error drawing boxes:", error);
  }
};

const recentPredictions: number[] = [];

const updateRecentPredictions = (confidence: number): void => {
  if (recentPredictions.length >= 4) {
    recentPredictions.shift();
  }
  recentPredictions.push(confidence)

  if (recentPredictions.length === 4) {
    const avgConf = recentPredictions.reduce((acc, val) => acc + val, 0) / 4;

    if (avgConf >= 0.8) {
      setFoundItems(foundItems + 1);
      console.log("Confidence met, changing to next item.");
      recentPredictions.length = 0;
    }
  }
}

/**
 * Runs detection on a single frame
 */
const detectFrame = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  videoElement: HTMLVideoElement,
  callback: (predictions: Prediction[]) => void
) => {
  if (!model) return;

  // Filter predictions based on confidence
  const confidenceThreshold = 0.5; //changed from .1

  try {
    // Get Raw Prediction Data
    const raw = await model.executeAsync(videoElement);
    // Execute model on current frame
    const predictions = formatPredictions(
      raw,
      videoElement,
      confidenceThreshold
    );
    // Call callback with predictions for drawing
    if (predictions.length > 0) {
      callback(predictions);

      const correctObjectPrediction = predictions.find(
        (prediction) => prediction.class === YOLO_CLASSES[foundItems]
      );

      if (correctObjectPrediction) {
        updateRecentPredictions(correctObjectPrediction.score)
      }
    }
  
    console.log("Predictions before RETURN in detectFrame():", predictions);
    return predictions;
  } catch (error) {
    console.error("Detection error:", error);
    return [];
  }
};

/**
 * Main detection loop
 */
export const runDetectionOnCurrentMedia = async (): Promise<void> => {
  const { currentMediaType, videoPlaying, setActiveDetectionLoop } =
    useGameStore.getState();
  const model = window.cvsModel; // or from your context/hook

  if (!currentMediaType || !model) {
    console.log("Missing required elements for detection");
    return;
  }

  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  if (!videoElement) {
    console.error("Video element not found");
    return;
  }

  // Clear any existing detection loop if still running
  let lastDetectionTime = 0;
  const DETECTION_INTERVAL = 100; // 10 FPS

  const detectionLoop = async (timestamp: number) => {
    if (timestamp - lastDetectionTime >= DETECTION_INTERVAL) {
      await detectFrame(model, videoElement, drawBoundingBoxes);
      lastDetectionTime = timestamp;
    }

    if (currentMediaType !== "image" && !videoElement.paused && videoPlaying) {
      const loopId = requestAnimationFrame(detectionLoop);
      setActiveDetectionLoop(loopId); // ✅ Set activeDetectionLoop in Zustand
    }
  };

  if (currentMediaType !== "image") {
    const loopId = requestAnimationFrame(detectionLoop);
    setActiveDetectionLoop(loopId); // ✅ Set activeDetectionLoop when the loop starts
  } else {
    await detectFrame(model, videoElement, drawBoundingBoxes);
    setActiveDetectionLoop(null); // No loop for images
  }
};

/**
 * Stops the detection loop
 */
export const stopDetection = (): void => {
  const { activeDetectionLoop, setActiveDetectionLoop } =
    useGameStore.getState();

  if (activeDetectionLoop) {
    // Cancel the active detection loop
    cancelAnimationFrame(activeDetectionLoop);
    setActiveDetectionLoop(null);
  }

  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  if (!canvasElement) return;

  const context = canvasElement.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

  console.log("Detection loop stopped and activeDetectionLoop cleared.");
};
