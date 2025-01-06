import { Socket } from "socket.io";

import { ServerContext } from "./socketTypes";
import { ChatMessage } from "./socketTypes";
import { GameStateUpdates } from "./socketTypes";
import { SocketConnection } from "./socketTypes";

import { playerStateReadyManager } from "./playerReadyStateManager";
import { peerJsManager } from "./peerJsManager";
import { chatMessageManager } from "./chatMessageManager";
import { gameStateManager } from "./gameStateManager";

// Handles all the socket connections and listeners
export const createSocketManager = (
  context: ServerContext
): SocketConnection => {
  const playerReadyManager = playerStateReadyManager(context);
  const peerManager = peerJsManager;
  const chatManager = chatMessageManager(context);
  const gameManager = gameStateManager(context);

  return {
    socketConnection: (socket: Socket) => {
      console.log("🔌 New SOCKET-IO Connection: ", socket.id);

      // Register connections with server context
      socket.on("registerUser", ({ userId, gameId }) => {
        // Check if they are already registered with a userId
        const userConnection = context.userConnections.get(userId);
        if (userConnection) {
          console.log(
            "User is already connected to the server, registering new connection settings..."
          );
          userConnection.socketId = socket.id;
          // update the server context
          context.userConnections.set(userId, userConnection);

          // check for a gameId in the user connection to RECONNECT!
          if (gameId) {
            console.log(
              `Player with id: ${userId} is joining room with id: ${gameId}`
            );
            socket.join(gameId);
          }
        }
      });

      // Set up all the event listeners for the socket
      socket.on("playerReady", (data) => playerReadyManager(socket, data));
      socket.on("chat-message", (data: ChatMessage) =>
        chatManager(socket, data)
      );
      socket.on("stateUpdate", (data: GameStateUpdates) =>
        gameManager(socket, data)
      );
      socket.on("registerPeerId", (data: ServerContext) => peerManager(data));
      // socket.on("opponentIdRequest", () => peerManager(socket, context));

      // Clean up the socket connection
      socket.on("disconnect", () => {
        console.log("🔌 SOCKET-IO Disconnected: ", socket.id);

        // context.userConnections.delete(socket.id); - preventing reconnect?
        // Delete the context of the player in the playerReadyStates

        // update the CORRECT user connection properly to avoid losing all the data
        for (const [userId, connection] of context.userConnections.entries()) {
          if (connection.socketId === socket.id) {
            // We have the right player/socket in context - erase their socket
            connection.socketId = "";
            // Update the context of the server
            context.userConnections.set(userId, connection);

            // Emit that the player has disconnected to the other players - ie gameId exists
            if (connection.gameId) {
              socket
                .to(connection.gameId)
                .emit("playerDisconnected", { userId });
            }
            // exit after emit
            break;
          }
        }
      });
    },
  };
};
