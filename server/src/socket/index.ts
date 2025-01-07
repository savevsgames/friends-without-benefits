import { Socket } from "socket.io";

import {
  ServerContext,
  ChatMessage,
  GameStateUpdates,
  SocketConnection,
} from "./socketTypes.js";

import { playerReadyStateManager } from "./playerReadyStateManager.js";
import { peerJsManager } from "./peerJsManager.js";
import { chatMessageManager } from "./chatMessageManager.js";
import { gameStateManager } from "./gameStateManager.js";

// Handles all the socket connections and listeners
export const createSocketManager = (
  context: ServerContext
): SocketConnection => {
  const playerReadyManager = playerReadyStateManager(context);
  const peerManager = peerJsManager;
  const chatManager = chatMessageManager(context);
  const gameManager = gameStateManager(context);

  return {
    socketConnection: (socket: Socket) => {
      console.log("🔌 New SOCKET-IO Connection: ", socket.id);

      // Register connections with server context
      socket.on("registerUser", ({ userId, gameId }) => {
        if (!userId || !gameId) {
          console.error("❌ Missing userId or gameId in registerUser event.");
          return;
        }

        let gameRoom = context.gameRooms.get(gameId);
        if (!gameRoom) {
          console.log(
            `🛠️ Game room ${gameId} not found. Creating a new room...`
          );
          gameRoom = {
            gameId,
            hostId: userId,
            players: new Map(),
            gameState: "setup",
          };
          context.gameRooms.set(gameId, gameRoom);
          console.log(`✅ Game room ${gameId} created with host ${userId}`);
        }

        // Check if they are already registered with a userId
        // IF NOT, register them with the server context!!!!!!
        let userConnection = context.userConnections.get(userId);
        if (!userConnection) {
          userConnection = {
            userId,
            socketId: socket.id,
            peerId: "", // MAY NEED TO FIND A WAY TO GET THIS?
            gameId,
            isHost: gameRoom.hostId === userId,
            isReady: false, // may need to change this ...
          };
          // set the user connection in the server context since it WAS NOT THERE BEFORE!!!!
          context.userConnections.set(userId, userConnection);
        } else {
          console.log(`🔄 Updating existing user connection for ${userId}`);
          userConnection.socketId = socket.id;
          userConnection.gameId = gameId;
          context.userConnections.set(userId, userConnection);
        }
        // Add the user's connection details to the game room players map
        gameRoom.players.set(userId, userConnection);
        context.userConnections.set(userId, userConnection);

        // Join the gameId room with socket.join()
        console.log(
          `Player with id: ${userId} is joining room with id: ${gameId}`
        );
        socket.join(gameId);

        console.log(
          "🕵️‍♂️ User registered in manager with id: ",
          userId,
          "to game ",
          gameId
        );
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
        console.log("❌ SOCKET-IO Disconnected: ", socket.id);

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
