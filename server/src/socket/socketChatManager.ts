import { Socket } from "socket.io";
import { ChatMessage } from "./socketTypes";

const chatManager = () => {
  return (socket: Socket, data: ChatMessage) => {
    const { sender, message } = data;
  };
};
