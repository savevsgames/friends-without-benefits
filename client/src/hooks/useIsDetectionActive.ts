import { useGameStore } from "@/store";

// Custom hook to check if the detection loop is active - getter for activeDetectionLoop
export const useIsDetectionActive = () => {
  return useGameStore((state) => state.activeDetectionLoop !== null);
};
