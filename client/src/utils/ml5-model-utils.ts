import { drawBoundingBoxes } from "./model-utils";
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
