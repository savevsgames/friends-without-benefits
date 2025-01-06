import { Socket } from "socket.io";
import { ServerContext } from "./socketTypes";

export const playerReadyStateManager = (context: ServerContext) => {
  // return socket and connection data for players
  const { io, gameRooms, userConnections } = context;

  return (
    socket: Socket,
    { userId, gameId }: { userId: string; gameId: string }
  ) => {
    io.emit("startCountdown", 5);
    // make sure we are checking the right game room
    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      console.error(`❌ Game room ${gameId} not found`);
      return;
    }

    const userConnection = userConnections.get(userId);
    if (!userConnection) {
      console.error(`❌ User with ${userId} not found`);
      return;
    }

    // Update the user's readiness
    userConnection.isReady = true;
    userConnections.set(userId, userConnection);
    console.log("socket: ", socket, "has playerId: ", userId);
    console.log(`🎯 Player ${userId} is ready.`);

    // update the GameRoom with the status of the user
    gameRoom.players.set(userId, userConnection);
    console.log(`🎯 Player ${userId} is in game room: `, gameId);

    // Check that all players in the gameRoom are .isReady
    const allPlayersReady = Array.from(gameRoom.players.values()).every(
      (player) => player.isReady
    );
    // If all values are ready => return the countdown to start the "countdown"
    // gameState in gameStore.ts by emmiting the countdown to all clients
    if (allPlayersReady) {
      console.log("✅ All players are ready. Starting 5-second countdown.");
      // send the emit to the gameId to start the countdown
      io.to(gameId).emit("startCountdown", 5);
    }

    // Ready states are Maps of userIds and isReady from players in the game room
    const readyStates = Object.fromEntries(
      Array.from(gameRoom.players.entries()).map(([id, connection]) => [
        id,
        connection.isReady,
      ])
    );

    io.to(gameId).emit("updateReadyStates", readyStates);
  };
};

export default playerReadyStateManager;
