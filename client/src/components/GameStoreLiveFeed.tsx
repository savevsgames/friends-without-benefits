import { useGameStore, useMultiplayerStore } from "@/store";

// // Only used for development/debugging - shows all store data in one component for easy viewing
const GameStoreLiveFeed = () => {
  // Fetch entire Zustand store states
  const gameStore = useGameStore((state) => state);
  const multiplayerStore = useMultiplayerStore((state) => state);
  const maxLength = 20;

  const formatValue = (value: unknown): string => {
    // Handle null and undefined
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    // Handle functions
    if (typeof value === "function") {
      // return `[Function: ${value.name || "anonymous"}]`;
      return "()=>{}";
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return `[Array(${value.length})]`;
    }

    // Handle objects (including Dates, RegExp, etc.)
    if (typeof value === "object") {
      const type = value.constructor.name;
      // Special case for plain objects
      if (type === "Object") {
        const entries = Object.entries(value);
        if (entries.length === 0) return "{}";
        return `{${entries.length} keys}`;
      }
      return `[${type}]`;
    }

    // Handle primitives
    const stringified = String(value);
    if (stringified.length <= maxLength) return stringified;
    return stringified.substring(0, maxLength) + "...";
  };

  const trimString = (str: string, maxLength: number) => {
    const trimmed =
      str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
    return trimmed;
  };

  return (
    <>
      <h2>Debug Store Viewer</h2>
      <div
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          justifyContent: "start",
          maxHeight: "calc(100vh - 400px)",
        }}
      >
        <div>
          <h3>Game Store</h3>
          {Object.entries(gameStore).map(([key, value]) => (
            <div key={key} className="flex items-start p-2 m-2">
              <span className="font-mono text-sm text-blue-600 min-w-[120px]">
                {trimString(key, 20)}:
              </span>
              <span className="font-mono text-sm text-gray-700 break-all">
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>
        <div>
          <h3>Multiplayer Store</h3>
          {Object.entries(multiplayerStore).map(([key, value]) => (
            <div key={key} className="flex items-start">
              <span className="font-mono text-sm text-blue-600 min-w-[120px]">
                {key}:
              </span>
              <span className="font-mono text-sm text-gray-700 break-all">
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GameStoreLiveFeed;
