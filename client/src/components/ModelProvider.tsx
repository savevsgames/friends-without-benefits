import React from "react";
import { useCustomVisionModel } from "@/hooks/useCustomVisionModel";

interface ModelProviderProps {
  children: React.ReactNode;
}

// ModelProvider ensures the model initializes on mount then allows context without having to check store for the model every time we reference it
export const ModelProvider: React.FC<ModelProviderProps> = ({ children }) => {
  // Custom hook that handles Zustand updates for loading the model
  useCustomVisionModel();

  return <>{children}</>;
};
