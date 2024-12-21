declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv: any;
    Module: OpenCVModule; // Adding `Module` to the window object for openCV.js
  }
}

// Define the OpenCVModule interface based on the runtime properties we're using
interface OpenCVModule {
  calledRun?: boolean; // Flag to check if the runtime has been initialized
  onRuntimeInitialized?: () => void; // Callback function for runtime initialization
}

export {};
