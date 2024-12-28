import React, { useState, useEffect } from "react";
import { useMultiplayerStore } from "@/store";

const MultiplayerChat = () => {
  const { socket, isConnected, chatMessages, addChatMessage, playerId } =
    useMultiplayerStore();

  // For local chat message state on react / DOM component
  const [message, setMessage] = useState<string>("");

  // Handle incoming socket.io chat messages
  useEffect(() => {}, [socket, addChatMessage]);

  // Send message to the socket.io server
  const sendMessage = () => {};

  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  return <div>MultiplayerChat</div>;
};
export default MultiplayerChat;
