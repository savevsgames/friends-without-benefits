// // Will handle game state updates
// import { Socket } from "socket.io";
// import { ServerContext } from "./socketTypes";

// // TODO: Will be refactored to handle all store updates from the server to the clients

// export const gameStateManager = (context: ServerContext) => {
//   // Will return a socket and gameState data for whichever store is called.
//   return (socket: Socket, data: any) => {
//     const { store, updates } = data;
//     try {
//       if (store === "game") {
//         console.log("🔄 Game State Update:", updates);
//         socket.broadcast.emit("stateUpdate", { store: "game", updates });
//       } else if (store === "multiplayer") {
//         console.log("🔄 Multiplayer State Update:", updates);
//         socket.broadcast.emit("stateUpdate", { store: "multiplayer", updates });
//       } else {
//         console.error("❗ Error accessing ZUSTAND store: ", store);
//       }
//     } catch (error) {
//       console.error("❗ Error updating ZUSTAND state:", error);
//     }
//   };
// };

// export default gameStateManager;
