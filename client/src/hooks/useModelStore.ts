import { useModelStore } from "@/store";

// Custom Hook to use Model State
export const useModel = () => {
  const isLoading = useModelStore((state) => state.isLoading);
  const error = useModelStore((state) => state.error);
  const model = useModelStore((state) => state.model);
  const setLoading = useModelStore((state) => state.setLoading);
  const setError = useModelStore((state) => state.setError);
  const setModel = useModelStore((state) => state.setModel);

  return {
    isLoading,
    error,
    model,
    setLoading,
    setError,
    setModel,
  };
};
