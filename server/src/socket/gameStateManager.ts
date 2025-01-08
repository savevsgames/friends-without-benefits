// Will handle game state updates
import { Socket } from "socket.io";
import { ServerContext } from "./socketTypes";

// TODO: Will be refactored to handle nearly all store updates from the server to the clients
// TODO: Must not use where we also need to update the server context?

export const gameStateManager = (context: ServerContext) => {
  // Will return a socket and gameState data for whichever store is called.
  const { io, gameRooms } = context;

  return (socket: Socket, data: any) => {
    const { store, updates, gameId } = data;
    console.log("Socket ID returning: ", socket.id);
    try {
      if (!gameId || !gameRooms.has(gameId)) {
        console.error(`❗ Game ID: ${gameId} not found in gameRooms map.`);
        return;
      }

      if (store === "game") {
        console.log("🔄 Game State Update:", updates);
        io.to(gameId).emit("stateUpdate", { store: "game", updates });
      } else if (store === "multiplayer") {
        console.log("🔄 Multiplayer State Update:", updates);
        io.to(gameId).emit("stateUpdate", { store: "multiplayer", updates });
      } else {
        console.error("❗ Error accessing ZUSTAND store: ", store);
      }
    } catch (error) {
      console.error("❗ Error updating ZUSTAND state:", error);
    }
  };
};

export default gameStateManager;
