// // Note: Utility functions for the application
// import { useGameStore } from "@/store";
// import * as tf from "@tensorflow/tfjs";
// // import { useMultiplayerStore } from "@/store";

// interface Prediction {
//   bbox: [number, number, number, number]; // [x, y, width, height]
//   class: string;
//   score: number;
// }

// // Custom YOLO classes - can add more as needed
// const YOLO_CLASSES: { [key: number]: string } = {
//   0: "sunglasses",
// };

// /**
//  * Maps class names to specific colors for bounding boxes.
//  * @param className Class name of the detected object
//  * @returns RGBA color array
//  */
// export const colorForLabels = (className: string) => {
//   const blue = [255, 0, 0, 255];
//   const green = [0, 255, 0, 255];
//   const red = [0, 0, 255, 255];
//   const colors: { [key: string]: number[] } = {
//     // Can add more colors to match the classes we want to detect
//     person: blue,
//     bottle: green,
//     default: red,
//   };
//   //
//   return colors[className] || colors.default;
// };

// export const drawBoundingBoxes = (predictions: Prediction[]): void => {
//   const canvasElement = document.getElementById(
//     "canvas-main"
//   ) as HTMLCanvasElement;
//   const imageElement = document.getElementById(
//     "image-output"
//   ) as HTMLImageElement;
//   const videoElement = document.getElementById(
//     "video-output"
//   ) as HTMLVideoElement;
//   const context = canvasElement?.getContext("2d");

//   if (!canvasElement || !context) return;

//   const cv = window.cv;
//   if (!cv) return;

//   try {
//     const currentMediaType = useGameStore.getState().currentMediaType;
//     // Create one source element (img or video) based on the current media type
//     const sourceElement =
//       currentMediaType === "image" ? imageElement : videoElement;

//     if (!sourceElement) return;

//     // Get the actual dimensions of the source media
//     const sourceWidth =
//       currentMediaType === "image"
//         ? imageElement.naturalWidth
//         : videoElement.videoWidth;
//     const sourceHeight =
//       currentMediaType === "image"
//         ? imageElement.naturalHeight
//         : videoElement.videoHeight;

//     // Set canvas to match source dimensions, not display dimensions
//     canvasElement.width = sourceWidth;
//     canvasElement.height = sourceHeight;
//     console.log(
//       "Canvas dimensions:",
//       canvasElement.width,
//       "x",
//       canvasElement.height
//     );

//     // Create transparent Mat at source dimensions
//     const dstMat = new cv.Mat(
//       canvasElement.height,
//       canvasElement.width,
//       cv.CV_8UC4
//     );
//     dstMat.setTo(new cv.Scalar(0, 0, 0, 0));

//     // Calculate scaling for Bounding Box dynamically based on source dimensions
//     const minDimension = Math.min(canvasElement.height, canvasElement.width);
//     const boxThickness = Math.max(2, Math.floor(minDimension * 0.003));
//     const fontSize = Math.max(0.7, minDimension * 0.001);
//     const labelHeight = 50;
//     const textPadding = 10;

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     predictions.forEach((prediction: any) => {
//       const { bbox, class: className, score: confScore } = prediction;
//       // Use raw coordinates from prediction - they're already in source dimensions
//       const [x, y, width, height] = bbox.map((val: number) => val);
//       const color = colorForLabels(className);

//       // Draw bounding box and label box
//       cv.rectangle(
//         dstMat,
//         new cv.Point(x, y),
//         new cv.Point(x + width, y + height),
//         color,
//         boxThickness
//       );

//       cv.rectangle(
//         dstMat,
//         new cv.Point(x, y - labelHeight),
//         new cv.Point(x + width, y),
//         color,
//         -1
//       );
//       // Draw label text
//       const text = `${className} ${Math.round(confScore * 100)}%`;
//       cv.putText(
//         dstMat,
//         text,
//         new cv.Point(x + textPadding, y - textPadding),
//         cv.FONT_HERSHEY_DUPLEX,
//         fontSize,
//         new cv.Scalar(255, 255, 255, 255),
//         Math.max(1, Math.floor(fontSize / 2))
//       );
//     });

//     // Draw to canvas at source dimensions
//     const imageData = new ImageData(dstMat.cols, dstMat.rows);
//     const data = dstMat.data;
//     for (let i = 0; i < data.length; i += 4) {
//       imageData.data[i] = data[i + 2];
//       imageData.data[i + 1] = data[i + 1];
//       imageData.data[i + 2] = data[i];
//       imageData.data[i + 3] = data[i + 3];
//     }

//     // 7. Draw final imageData to canvas
//     context.putImageData(imageData, 0, 0);
//     // Clean up
//     dstMat.delete();
//     console.log("Bounding boxes drawn on canvas!");
//   } catch (error) {
//     console.error("Error drawing boxes:", error);
//   }
// };

// /**
//  * Run detection on the current media in the canvas.
//  * Uses the store to access the current media type and video playing status.
//  */
// export const runDetectionOnCurrentMedia = async (): Promise<void> => {
//   const { currentMediaType } = useGameStore.getState();

//   if (!currentMediaType) {
//     console.log(
//       "Invalid media type or no media type selected. Cannot run detection."
//     );
//     return;
//   }

//   const model = window.yoloModel;
//   if (!model) {
//     console.log("YOLO model not loaded. Cannot run detection.");
//     return;
//   }

//   const canvasElement = document.getElementById(
//     "canvas-main"
//   ) as HTMLCanvasElement;
//   const videoElement = document.getElementById(
//     "video-output"
//   ) as HTMLVideoElement;

//   if (!videoElement || !canvasElement) {
//     console.error("Video or Canvas element not found.");
//     return;
//   }

//   // Set canvas dimensions
//   canvasElement.width = videoElement.videoWidth || 640;
//   canvasElement.height = videoElement.videoHeight || 480;

//   const detectFrame = async () => {
//     try {
//       if (!window.yoloModel) {
//         console.error("Model not loaded");
//         return;
//       }
//       const videoPlaying = useGameStore.getState().videoPlaying;
//       // Construct input tensor for shape [416,416]
//       const inputTensor = window.tf.browser
//         .fromPixels(videoElement)
//         .resizeNearestNeighbor([416, 416])
//         .toFloat()
//         .div(255)
//         .expandDims(0);

//       // Run inference with custom model that does NMS and returns multiple output tensors
//       // e.g., [boxes, scores, classes, validDetections]
//       const predictions = (await window.yoloModel.executeAsync(
//         inputTensor
//       )) as tf.Tensor[];

//       // Extract & parse detection outputs
//       const boxes = (await predictions[0].array()) as number[][][]; // shape [batch, maxDet, 4]
//       const scores = (await predictions[1].array()) as number[][];
//       const classes = (await predictions[2].array()) as number[][];
//       const countArr = (await predictions[3].data()) as Float32Array; // [batch], number of valid detections
//       const validDetections = countArr[0];

//       // Convert each detection to Prediction type
//       // boxes[0][i] = [x1, y1, x2, y2]
//       const mappedPredictions: Prediction[] = [];
//       for (let i = 0; i < validDetections; i++) {
//         const [x1, y1, x2, y2] = boxes[0][i];
//         const labelIndex = classes[0][i];
//         const score = scores[0][i];

//         // Convert [x1,y1,x2,y2] → [x, y, width, height]
//         const width = x2 - x1;
//         const height = y2 - y1;

//         mappedPredictions.push({
//           bbox: [x1, y1, width, height],
//           class: YOLO_CLASSES[labelIndex] || "unknown",
//           score,
//         });
//       }

//       // Draw bounding boxes
//       drawBoundingBoxes(mappedPredictions);

//       // Cleanup Tensors
//       window.tf.dispose([inputTensor, ...predictions]);

//       // Recursive call
//       if (!videoElement.paused && videoPlaying) {
//         requestAnimationFrame(detectFrame);
//       }
//     } catch (error) {
//       console.error("Error during NMS-based YOLO inference:", error);
//     }
//   };

//   // 9. Start detection on next animation frame
//   requestAnimationFrame(detectFrame);
// };

// /**
//  * Stop detection and clear canvas
//  */
// export const stopDetection = (): void => {
//   const canvasElement = document.getElementById(
//     "canvas-main"
//   ) as HTMLCanvasElement;
//   if (!canvasElement) return;

//   const ctx = canvasElement.getContext("2d");
//   if (ctx) {
//     ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//   }
// };
