import { Socket } from "socket.io";
import { ServerContext } from "./socketTypes";

// Handles all the peer Js connections and listeners
export const peerJsManager = (socket: Socket, context: ServerContext) => {
  const { connectedUsers } = context;

  // Register peerId
  const registerPeerId = (peerId: string) => {
    connectedUsers.set(socket.id, peerId);
    console.log("✅ Peer ID registered: ", peerId);
  };

  // Request opponent's ID
  const opponentIdRequest = () => {
    const opponentId = connectedUsers.get(socket.id);
    if (opponentId) {
      socket.emit("opponentId", opponentId);
    }
  };

  // Register peerId
  socket.on("registerPeerId", registerPeerId);

  // Request opponent's ID
  socket.on("opponentIdRequest", opponentIdRequest);

  // TODO: Add reconnection logic using a Map to link existing
  // Map of connectedUsers to new map with mongoDB ids / repeatable ids
  // socket and peer ids are changed on reconnection

  // Unregister peerId
  socket.on("disconnect", () => {
    context.connectedUsers.delete(socket.id);
    console.log("❌ Peer ID unregistered: ", socket.id);
  });
};

export default peerJsManager;
