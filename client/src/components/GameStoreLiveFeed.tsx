import { useGameStore, useMultiplayerStore } from "@/store";

// // Helper function to safely stringify objects without throwing errors
// const safeStringify = (
//   obj: Record<string, unknown>,
//   maxLength: number = 20
// ) => {
//   try {
//     const objectCache = new Set();
//     return JSON.stringify(
//       obj,
//       (_key, value) => {
//         // console.log("key:", key, "value:", value);
//         if (typeof value === "object" && value !== null) {
//           if (objectCache.has(value)) {
//             // Circular reference found, discard key
//             return;
//           }
//           // Store value in our set
//           objectCache.add(value);
//         }
//         if (typeof value === "function") {
//           return `[Function: ${value.name || "Anonymous () "}]` + `=> {...}`;
//         }
//         // Trim non-string values to maxLength
//         if (typeof value !== "string" && !Array.isArray(value)) {
//           return JSON.stringify(value).substring(0, maxLength) + "...";
//         }
//         return value;
//       },
//       2
//     ); // 2-space indentation
//   } catch (error) {
//     console.error("Error stringifying object:", error);
//     return;
//   }
// };

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const renderAllFields = (store: Record<string, any>) => {
//   return (
//     <div>
//       <ul>
//         {Object.entries(store).map(([key, value]) => (
//           <li key={key} style={{ fontSize: "1.rem", color: "red" }}>
//             <strong>{key}</strong>:{" "}
//             {/* If the value is a non-null object, stringify it before displaying to prevent errors */}
//             {safeStringify(value)}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

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

  return (
    <>
      <h2>Debug Store Viewer</h2>
      <div
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "row",
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
                {key}:
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
