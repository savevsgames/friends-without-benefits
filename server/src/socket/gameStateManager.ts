// Will handle game state updates
import { Socket } from "socket.io";
import { ServerContext } from "./socketTypes";

// TODO: Will be refactored to handle nearly all store updates from the server to the clients
// TODO: Must not use where we also need to update the server context?

export const gameStateManager = (context: ServerContext) => {
  // Will return a socket and gameState data for whichever store is called.
  const { userConnections, gameRooms } = context;
  console.log(
    "Game State Manager : ",
    "User Connections",
    userConnections,
    "Game Rooms:",
    gameRooms
  );
  return (socket: Socket, data: any) => {
    const { store, updates } = data;
    try {
      if (store === "game") {
        console.log("🔄 Game State Update:", updates);
        socket.broadcast.emit("stateUpdate", { store: "game", updates });
      } else if (store === "multiplayer") {
        console.log("🔄 Multiplayer State Update:", updates);
        socket.broadcast.emit("stateUpdate", { store: "multiplayer", updates });
      } else {
        console.error("❗ Error accessing ZUSTAND store: ", store);
      }
    } catch (error) {
      console.error("❗ Error updating ZUSTAND state:", error);
    }
  };
};

export default gameStateManager;
