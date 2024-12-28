import React from "react";
import { useGameStore, useMultiplayerStore } from "@/store";

// Helper function to safely stringify objects without throwing errors
const safeStringify = (obj: Record<string, unknown>) => {
  try {
    const objectCache = new Set();
    return JSON.stringify(
      obj,
      (key, value) => {
        console.log("key:", key, "value:", value);
        if (typeof value === "object" && value !== null) {
          if (objectCache.has(value)) {
            // Circular reference found, discard key
            return;
          }
          // Store value in our set
          objectCache.add(value);
        }
        if (typeof value === "function") {
          return `[Function: ${value.name || "Anonymous () "}]` + `=> {...}`;
        }
        return value.slice(0, 50);
      },
      2
    ); // 2-space indentation
  } catch (error) {
    console.error("Error stringifying object:", error);
    return;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderAllFields = (store: Record<string, any>) => {
  return (
    <div>
      <ul>
        {Object.entries(store).map(([key, value]) => (
          <li key={key} style={{ fontSize: "1.rem", color: "red" }}>
            <strong>{key}</strong>:{" "}
            {/* If the value is a non-null object, stringify it before displaying to prevent errors */}
            {safeStringify(value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Only used for development/debugging - shows all store data in one component for easy viewing
const GameStoreLiveFeed: React.FC = () => {
  // Fetch entire Zustand store states
  const gameStore = useGameStore((state) => state);
  const multiplayerStore = useMultiplayerStore((state) => state);

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
          {renderAllFields(gameStore)}
        </div>
        <div>
          <h3>Multiplayer Store</h3>
          {renderAllFields(multiplayerStore)}
        </div>
      </div>
    </>
  );
};

export default GameStoreLiveFeed;
