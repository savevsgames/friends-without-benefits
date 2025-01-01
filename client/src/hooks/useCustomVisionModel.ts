import { useState, useEffect } from "react";

interface ModelStatus {
  isLoading: boolean;
  error: Error | null;
  //   eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any | null;
}

// Monitor the status of the Custom Vision model initialization
export const useCustomVisionModel = () => {
  const [status, setStatus] = useState<ModelStatus>({
    isLoading: true,
    error: null,
    model: null,
  });

  // Global scope check for script loading in index.html
  const [dependenciesLoaded, setDependenciesLoaded] = useState(false);
  // Check if required libraries are loaded
  const checkDependencies = (): boolean => {
    return Boolean(window.tf && window.cvstfjs);
  };

  // Initialize model
  const initializeModel = async () => {
    try {
      // Model Initialization Status update {isLoading: true, error: null, model: null}
      setStatus((prev) => ({ ...prev, isLoading: true }));

      // Azure Custom Vision Object Detection model
      window.cvsModel = new window.cvstfjs.ObjectDetectionModel();
      await window.cvsModel.loadModelAsync("/models/tfjs/model.json");

      setStatus({
        isLoading: false,
        error: null,
        model: window.cvsModel,
      });

      console.log("Custom Vision model loaded successfully!");
    } catch (error) {
      // Set loading and error states if model fails to load
      setStatus({
        isLoading: false,
        error: error as Error,
        model: null,
      });
      console.error("Error loading Custom Vision model:", error);
    }
  };

  // Check for dependencies on mount and when they change
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // Make sure necessary scripts are loaded
      if (checkDependencies()) {
        // Now we can trigger the model initialization
        setDependenciesLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  // Load model once [dependencies] are available / setDependenciesLoaded(true) in useEffect above
  useEffect(() => {
    if (dependenciesLoaded) {
      initializeModel();
    }
  }, [dependenciesLoaded]);

  return status;
};
