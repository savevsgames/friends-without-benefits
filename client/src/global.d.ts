declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv: any; // Adding `cv` to the window object for OpenCV.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cocoSsd: any; // Adding `cocoSsd` to the window object for coco-ssd
    Module: OpenCVModule; // Adding `Module` to the window object for OpenCV.js initialization
    Prediction: Prediction; // Adding `Prediction` to the window object
    Predictions: Prediction[];
    ml5: ml5Library; // Adding `ml5` to the window object for ml5.js
    ml5Loaded?: boolean; // Flag to check if ml5.js has been loaded
    myMl5Detector?: ml5ObjectDetector; // Adding `myMl5Detector` to the window object for ml5.js object detection

    // Adding `tf` to the window object for TensorFlow.js
    tf: typeof import("@tensorflow/tfjs"); // Reference to TensorFlow.js loaded via script
    yoloModel?: TFGraphModel; // YOLO Model loaded globally
  }
}

/**
 * TFJS Library Interface
 */
// Graph Model for TensorFlow.js
interface TFGraphModel {
  /**
   * Runs inference on the input and returns a single tensor or an array of tensors.
   */
  executeAsync: (
    input: tf.Tensor | tf.Tensor[]
  ) => Promise<tf.Tensor | tf.Tensor[]>;

  /**
   * Runs inference on the input and returns a tensor or an array of tensors.
   */
  execute: (input: tf.Tensor | tf.Tensor[]) => tf.Tensor | tf.Tensor[];
}

/**
 * OpenCV.js Module Loading Interface
 */

// Define the OpenCVModule interface based on the runtime properties we're using
interface OpenCVModule {
  calledRun?: boolean; // Flag to check if the runtime has been initialized
  onRuntimeInitialized?: () => void; // Callback function for runtime initialization
}

// ml5 coco Prediction Type -Premade Prediction model type for our in game scavenger hunt
// interface Prediction {
//   bbox: [number, number, number, number]; // [x, y, width, height]
//   class: string;
//   score: number;
// }

// TFJS custom model prediction type - Custom Prediction type for our in game scavenger hunt
interface Prediction {
  bbox: [number, number, number, number]; // [x, y, width, height]
  label: string; // Mapped from class index
  score: number; // Confidence score
}

/**
 * Ml5 Library Interface
 */

// ml5 Prediction for Classification - For re-training cocoSsd with user items (in testing) to make custom models
interface ml5Prediction {
  label: string; // Predicted label
  confidence: number; // Prediction confidence
}

// ml5 Image Classifier - For re-training cocoSsd with user items (in testing) to make custom models
interface ml5ImageClassifier {
  classify: (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ) => Promise<ml5Prediction[]>;
}

// ml5 Object Detector - For re-training cocoSsd with user items (in testing) to make custom models
interface ml5ObjectDetector {
  detect: (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ) => Promise<ml5Prediction[]>;
}

// ml5 Pose Keypoint for PoseNet - NOT IN USE YET
interface ml5Keypoint {
  position: { x: number; y: number }; // Keypoint coordinates
  score: number; // Keypoint confidence score
  part: string; // Body part (e.g., 'leftEye')
}

// ml5 Pose for PoseNet - NOT IN USE YET
interface ml5Pose {
  score: number; // Overall pose confidence score
  keypoints: ml5Keypoint[]; // Array of detected keypoints
}

// ml5 PoseNet - NOT IN USE YET
interface ml5PoseNet {
  singlePose: (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ) => Promise<ml5Pose[]>;
  multiPose: (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ) => Promise<ml5Pose[]>;
}

// ml5 Sound Prediction - NOT IN USE YET
interface ml5SoundPrediction {
  label: string; // Detected sound label
  confidence: number; // Sound prediction confidence
}

// ml5 Sound Classifier  - NOT IN USE YET
interface ml5SoundClassifier {
  classify: () => Promise<ml5SoundPrediction[]>;
}

// ml5 Style Transfer - NOT IN USE YET
interface ml5StyleTransfer {
  transfer: (
    input: HTMLImageElement | HTMLCanvasElement
  ) => Promise<HTMLImageElement>;
}

// Define the ml5Library interface based on the runtime properties we're using
// Classifier and Detector take in and image from a valid source and returns a Promise
// of an array of predictions.
// The classifier is used for training. The detector is used for object detection/gameplay
// poseNet, soundClassifer and styleTranser are also optional long term methods available in the
// library and we may use them to create more games.
interface ml5Library {
  imageClassifier: (model: string) => Promise<ml5ImageClassifier>;
  objectDetector: (model: string) => Promise<ml5ObjectDetector>;
  poseNet: () => Promise<ml5PoseNet>;
  soundClassifier: (model: string) => Promise<ml5SoundClassifier>;
  styleTransfer: (model: string) => Promise<ml5StyleTransfer>;
}

export {};
