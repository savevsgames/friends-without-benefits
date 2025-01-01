import React, { createContext, useContext } from "react";
import { useCustomVisionModel } from "../hooks/useCustomVisionModel";

interface ModelContextType {
  isLoading: boolean;
  error: Error | null;
  //   eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any | null;
}

// Model loading context and ref for the Custom Vision model
const ModelContext = createContext<ModelContextType | null>(null);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const modelStatus = useCustomVisionModel();

  // Provides model context to all children components
  // The Provider is located in the <main> App component so it can wrap the <Game> component
  return (
    <ModelContext.Provider value={modelStatus}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within ModelProvider");
  }
  return context;
};
