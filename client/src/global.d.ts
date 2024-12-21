declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv: any;
    Module: OpenCVModule; // Adding `Module` to the window object for openCV.js
    Prediction: Prediction; // Adding `Prediction` to the window object for prediction
    Predictions: Prediction[]; // Adding `Predictions` to the window object for predictions
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
