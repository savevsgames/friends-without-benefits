import { useEffect, useState, useCallback } from "react";
import { useModelStore } from "@/store";

// Monitor the status of the Custom Vision model initialization
export const useCustomVisionModel = () => {
  const setLoading = useModelStore((state) => state.setLoading);
  const setError = useModelStore((state) => state.setError);
  const setModel = useModelStore((state) => state.setModel);

  const [dependenciesLoaded, setDependenciesLoaded] = useState(false);

  // Check if required libraries are loaded
  const checkDependencies = (): boolean => {
    return Boolean(window.tf && window.cvstfjs);
  };

  // InitializeModel is wrapped with useCallback 
  // Ensures it only updates when setLoading, setError, or setModel change
  const initializeModel = useCallback(async () => {
    try {
      setLoading(true);

      // Azure Custom Vision Object Detection model
      window.cvsModel = new window.cvstfjs.ObjectDetectionModel();
      await window.cvsModel.loadModelAsync("/models/tfjs/model.json");

      setModel(window.cvsModel);
      setError(null);
      setLoading(false);

      console.log("Custom Vision model loaded successfully!");
    } catch (error) {
      setError(error as Error);
      setModel(null);
      setLoading(false);

      console.error("Error loading Custom Vision model:", error);
    }
  }, [setLoading, setError, setModel]);

  // Check for dependencies on mount
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (checkDependencies()) {
        setDependenciesLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  // Load model once dependencies are available
  useEffect(() => {
    if (dependenciesLoaded) {
      initializeModel();
    }
  }, [dependenciesLoaded, initializeModel]);

  // Return Zustand state for reference if needed
  return {
    isLoading: useModelStore((state) => state.isLoading),
    error: useModelStore((state) => state.error),
    model: useModelStore((state) => state.model),
  };
};
