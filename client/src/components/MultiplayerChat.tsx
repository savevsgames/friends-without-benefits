import { useState, useEffect, useRef } from "react";

import { useMultiplayerStore } from "@/store";
import GameStoreLiveFeed from "./GameStoreLiveFeed";

const MultiplayerChat = () => {
  const {
    socket,
    // isConnected,
    chatMessages,
    addChatMessage,
    playerId,
  } = useMultiplayerStore();

  // For local chat message state on react / DOM component
  const [message, setMessage] = useState<string>("");

  // Use a Ref to ensure only one listener is attached (avoid echoing messages in chat)
  const isListenerAttached = useRef(false);

  // Handle incoming socket.io chat messages
  useEffect(() => {
    if (!socket) {
      console.log("No socket connection");
      return;
    }
    // Avoids echoing messages in chat
    if (isListenerAttached.current) {
      console.warn("⚠️ Chat listener is already attached ⚠️");
      return;
    }
    // Handle incoming chat messages
    const handleChatMessage = (data: { sender: string; message: string }) => {
      // Add a check to see if the sender is the current player to avoid echoing the message
      // if (data.sender === playerId) return; - not needed for now

      addChatMessage(data);
      console.log("Chat Message Received:", data);
    };

    if (!socket) {
      console.log("No socket connection");
      return;
    }

    // Attach the event listener only once
    isListenerAttached.current = true;
    socket.on("chat-message", handleChatMessage);

    return () => {
      // Update the ref to allow re-attaching the listener
      isListenerAttached.current = false;
      socket.off("chat-message", handleChatMessage);
    };

    // Clean-up: when socket is disconnected, remove the event listener
  }, [socket, addChatMessage, playerId]);

  // Send message to the socket.io server
  const sendMessage = () => {
    if (!socket) {
      console.error("No socket connection");
      return;
    }

    if (!message.trim()) {
      // Alert the user with a pop up if they try to send an empty message - custom modal eventually
      window.alert("Please enter a message");
      console.error("Please enter a message");
      return;
    }

    // Construct the chat message object with the playerId from the multiplayer store and the message from the local state input
    const chatData = { sender: playerId, message };

    // Emit the chat message to the server
    socket.emit("chat-message", chatData);
    console.log("Chat Message Sent:", { sender: playerId, message });

    // Clear the input field
    setMessage("");
  };

  // if (!isConnected) {
  //   return <div>Connecting...</div>;
  // }

  return (
    <div>
      <h3>Multiplayer Chat</h3>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "space-between",
        }}
      >
        <input
          id="message_input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button
          id="send_message_button"
          onClick={sendMessage}
          style={{
            marginLeft: "1rem",
            border: "1px solid black",
            padding: "0.25rem 0.5rem",
          }}
        >
          Send Message
        </button>
      </div>
      <div>
        {chatMessages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}</strong>: {msg.message}
          </p>
        ))}
      </div>
      <GameStoreLiveFeed />
    </div>
  );
};
export default MultiplayerChat;
