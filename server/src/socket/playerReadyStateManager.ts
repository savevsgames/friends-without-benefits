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
    console.log("socket: ", socket.id, "has playerId: ", userId);
    console.log(`🎯 Player ${userId} is ready.`);

    // ✅ Update Ready State in `gameRooms` by extracting the player and
    // updating the isReady property
    if (gameRoom.players.has(userId)) {
      const player = gameRoom.players.get(userId);
      if (player) {
        player.isReady = true;
        gameRoom.players.set(userId, player);
        console.log(
          `✅ Player ${userId} marked as ready in game room ${gameId}`
        );
      }
    } else {
      console.error(`❌ Player ${userId} not found in game room players.`);
    }

    // 🔄 Broadcast Updated Ready States to Clients
    const readyStates = Object.fromEntries(
      Array.from(gameRoom.players.entries()).map(([id, player]) => [
        id,
        player.isReady,
      ])
    );
    io.to(gameId).emit("updateReadyStates", readyStates);
    console.log(`📤 Emitted updated ready states for room ${gameId}:`);

    // 🚦 Handle Single-Player Game
    if (gameRoom.gameType === "single") {
      console.log("🚦 Single-player game detected. Starting countdown...");
      io.to(gameId).emit("startCountdown", 5);
      // Update the game state to countdown in server context
      gameRoom.gameState = "countdown";
      return;
    }

    // 🚦 Handle Multiplayer Game
    let allPlayersReady = false;
    if (gameRoom.gameType === "multi") {
      const numPlayers = gameRoom.players.size;
      

      if (numPlayers < 2) {
        console.log(
          "🚦 Multi-player game detected. Waiting for all players to be ready..."
        );
        allPlayersReady = false;
      } else {
        allPlayersReady = Array.from(gameRoom.players.values()).every(
          (player) => player.isReady
        );
      }
    }

    if (allPlayersReady) {
      console.log("✅ All players are ready. Starting countdown...");
      io.to(gameId).emit("startCountdown", 5);
      // Update the game state to countdown in server context
      gameRoom.gameState = "countdown";
    } else {
      console.log("⏳ Waiting for more players to be ready...");
    }

    // Table log of the ready states for debugging
    console.log("🏃‍♀️ Ready States in Game Room:");
    console.table(
      Array.from(gameRoom.players.entries()).map(([id, player]) => ({
        userId: id,
        isReady: player.isReady,
      }))
    );
  };
};

export default playerReadyStateManager;
