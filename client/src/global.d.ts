declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv: any; // Adding `cv` to the window object for OpenCV.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cocoSsd: any; // Adding `cocoSsd` to the window object for coco-ssd
    Module: OpenCVModule; // Adding `Module` to the window object for OpenCV.js initialization
    Prediction: Prediction; // Adding `Prediction` to the window object
    Predictions: Prediction[];
  }
}

// Define the OpenCVModule interface based on the runtime properties we're using
interface OpenCVModule {
  calledRun?: boolean; // Flag to check if the runtime has been initialized
  onRuntimeInitialized?: () => void; // Callback function for runtime initialization
}

// Define Prediction Type
interface Prediction {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

export {};
