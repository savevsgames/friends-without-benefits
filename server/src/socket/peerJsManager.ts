import { Socket } from "socket.io";
import { ServerContext } from "./socketTypes";

// Handles all the peer Js connections and listeners
export const peerJsManager = (context: ServerContext) => {
  return (
    socket: Socket,
    { userId, peerId }: { userId: string; peerId: string }
  ) => {
    // const { io, gameRooms, userConnections } = context;
    // The user should be connected to the server at this point so their connection is in context
    const userConnection = context.userConnections.get(userId);

    // Register peerId
    if (userConnection) {
      userConnection.peerId = peerId;
      console.log("✅ Peer ID registered to connected user: ", peerId);
      userConnection.socketId = socket.id;
      console.log("✅ Socket ID registered to connected user: ", socket.id);

      // update the server context with the new connectedUser values
      context.userConnections.set(userId, userConnection);

      // If the user is joining a game, notify the other
      // players in the same gameId with socket.to
      if (userConnection.gameId) {
        const gameRoom = context.gameRooms.get(userConnection.gameId);
        if (gameRoom) {
          socket
            .to(userConnection.gameId)
            .emit("peerUpdate", { userId, peerId });
        }
      }
    } else {
      // Create a new peer connection if they are not in the server context yet
      context.userConnections.set(userId, {
        socketId: socket.id,
        peerId,
        userId,
        isHost: false,
        isReady: false,
      });
    }

    // TODO: Add reconnection logic using a Map to link existing
    // using the server context we now manage game rooms and currently connected users

    console.log("❌ Peer ID unregistered: ", socket.id);
  };
};

export default peerJsManager;
