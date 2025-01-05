// Will handle game state updates
import { Socket } from "socket.io";

const gameStateManager = () => {
  // Will return a socket and gameState data for whichever store is called.
  return (socket: Socket, data: any) => {
    console.log(
      `Socket ${socket.id} Returning ${data.updates} from ${data.store}.`
    );
  };
};
