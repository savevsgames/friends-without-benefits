import { Socket } from "socket.io";
import { ChatMessage, ServerContext } from "./socketTypes";

export const chatMessageManager = (context: ServerContext) => {
  return (socket: Socket, data: ChatMessage) => {
    const { sender, message } = data;
    // TODO: Add logic to change to username?
    console.log(`Socket ${socket.id} sent message: ${message}`);
    context.io.emit("chat-message", { sender, message });
  };
};

export default chatMessageManager;

/** SOCKET EMIT OPTIONS
 *  This would only send to the socket that sent the message
 *  socket.emit("chat-message", data);
 *
 *  This sends to all sockets EXCEPT the sender
 *  socket.broadcast.emit("chat-message", data);
 *
 *  This sends to ALL sockets including the sender
 *  => We use this in the chatManager to update the chat history for all players
 *  context.io.emit("chat-message", data);
 *
 */
