import { Socket } from "socket.io";
import { ServerContext } from "./socketTypes";

export const playerStateReadyManager = (context: ServerContext) => {
  const { io, playerReadyStates } = context;

  return (socket: Socket, { playerId }: { playerId: string }) => {
    // Set the player in playerReadyStates (server context) with the [playerId] to ready
    playerReadyStates[playerId] = true;
    console.log("socket: ", socket, "has playerId: ", playerId);
    console.log(`🎯 Player ${playerId} is ready.`);
    console.log("playerReadyStates", playerReadyStates);

    const allPlayersReady = Object.values(playerReadyStates).every(
      (ready) => ready === true
    );
    // Check that all values are ready => return the countdown to start the "countdown"
    // gameState in gameStore.ts by emmiting the countdown to all clients
    if (allPlayersReady) {
      console.log("✅ All players are ready. Starting 5-second countdown.");
      io.emit("startCountdown", 5);
    }

    io.emit("updateReadyStates", playerReadyStates);
  };
};

export default playerStateReadyManager;
