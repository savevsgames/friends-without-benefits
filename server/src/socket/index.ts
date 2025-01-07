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
      socket.on("registerUser", ({ userId, gameId, gameType }) => {
        console.log("🔑 Registering Challenger");
        console.log("🧑👧 userId:", userId);
        console.log("🎯 gameId:", gameId);
        console.log("1️⃣💫2️⃣ gameType:", gameType);

        if (!userId || !gameId || !gameType) {
          console.error(
            "❌ Missing userId, gameId, or gameType in registerUser."
          );
          socket.emit("userRegistered", {
            success: false,
            message: "Missing required parameters.",
          });
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
            gameType, // single or multi type added so isReady is easier to manage
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

        // Emit to client that the user has successfully registered
        socket.emit("userRegistered", {
          success: true,
          message: "User successfully registered.",
        });

        // Check to make sure string has no \n or \r
        const sanitizedGameId = String(gameId).trim();
        console.log(
          `🕵️‍♂️ User registered in manager with id: ${userId} to game: [${sanitizedGameId}]`
        );
        console.log(`✅ User ${userId} joined game room ${sanitizedGameId}.`);
        socket
          .to(sanitizedGameId)
          .emit("playerJoined", { userId, isHost: userConnection.isHost });

        // Function for logging / debugging the context that will not run in production
        // function logContext(context: ServerContext) {
        //   console.log("📊 Game Rooms Context:");
        //   for (const [id, room] of context.gameRooms.entries()) {
        //     console.log(`  - Room ID: ${id}`);
        //     console.log(`    Host ID: ${room.hostId}`);
        //     console.log(`    Game State: ${room.gameState}`);
        //     console.log(`    Game Type: ${room.gameType}`);
        //     console.log(
        //       `    Players in Room: ${Array.from(room.players.keys()).join(
        //         ", "
        //       )}`
        //     );
        //   }

        //   console.log("📊 User Connections Context:");
        //   for (const [id, connection] of context.userConnections.entries()) {
        //     console.log(`  - User ID: ${id}`);
        //     console.log(`    Socket ID: ${connection.socketId}`);
        //     console.log(`    Game ID: ${connection.gameId}`);
        //     console.log(`    Is Host: ${connection.isHost}`);
        //     console.log(`    Is Ready: ${connection.isReady}`);
        //   }
        // }

        // if (
        //   process.env.NODE_ENV === "development" ||
        //   process.env.NODE_ENV === "staging" ||
        //   process.env.NODE_ENV === "testing"
        // ) {
        //   logContext(context);
        //   console.log("📊 Current Active Users: ", context.numCurrentActiveUsers);
        // }
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
