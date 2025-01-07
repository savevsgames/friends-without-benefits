import { Socket } from "socket.io";
import { ServerContext } from "./socketTypes";

export const playerReadyStateManager = (context: ServerContext) => {
  // return socket and connection data for players
  const { io, gameRooms, userConnections } = context;

  return (
    socket: Socket,
    { userId, gameId }: { userId: string; gameId: string }
  ) => {
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

    io.to(gameId).emit("startCountdown", 5);

    // Update the user's readiness
    userConnection.isReady = true;
    userConnections.set(userId, userConnection);
    console.log("socket: ", socket, "has playerId: ", userId);
    console.log(`🎯 Player ${userId} is ready.`);

    // update the GameRoom with the status of the user
    gameRoom.players.set(userId, userConnection);
    console.log(`🎯 Player ${userId} is in game room: `, gameId);

    // Check readiness based on game type
    if (gameRoom.gameType === "single") {
      console.log("🚦 Single-player game detected. Starting countdown...");
      io.to(gameId).emit("startCountdown", 5);
      return;
    }

    if (gameRoom.gameType === "multi") {
      const allPlayersReady = Array.from(gameRoom.players.values()).every(
        (player) => player.isReady
      );

      if (allPlayersReady) {
        console.log("✅ All players are ready. Starting countdown...");
        io.to(gameId).emit("startCountdown", 5);
      }
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
