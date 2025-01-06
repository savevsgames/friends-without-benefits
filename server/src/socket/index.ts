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

      // Set up all the event listeners for the socket
      socket.on("playerReady", (data) => playerReadyManager(socket, data));
      socket.on("chat-message", (data: ChatMessage) =>
        chatManager(socket, data)
      );
      socket.on("stateUpdate", (data: GameStateUpdates) =>
        gameManager(socket, data)
      );

      socket.on("registerPeerId", (peerId: string) =>
        peerManager(socket, context)
      );
      socket.on("opponentIdRequest", () => peerManager(socket, context));

      // Clean up the socket connection
      socket.on("disconnect", () => {
        console.log("🔌 SOCKET-IO Disconnected: ", socket.id);
        context.connectedUsers.delete(socket.id);
        // Delete the context of the player in the playerReadyStates
        delete context.playerReadyStates[socket.id];
        socket.broadcast.emit("updateReadyStates", context.playerReadyStates);
      });
    },
  };
};
