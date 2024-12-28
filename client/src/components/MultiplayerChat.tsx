import { useState, useEffect } from "react";
import { useMultiplayerStore } from "@/store";

const MultiplayerChat = () => {
  const { socket, isConnected, chatMessages, addChatMessage, playerId } =
    useMultiplayerStore();

  // For local chat message state on react / DOM component
  const [message, setMessage] = useState<string>("");

  // Handle incoming socket.io chat messages
  useEffect(() => {
    // Handle incoming chat messages
    const handleChatMessage = (data: { sender: string; message: string }) => {
      addChatMessage(data);
      console.log("Chat Message Received:", data);
    };

    if (!socket) {
      console.log("No socket connection");
      return;
    }
    socket.on("chat-message", handleChatMessage);

    // Clean-up: when socket is disconnected, remove the event listener
    return () => {
      socket.off("chat-message", handleChatMessage);
    };
  }, [socket, addChatMessage]);

  // Update chat message state on change
  useEffect(() => {
    console.log("Chat Messages Updated:", chatMessages);
  }, [chatMessages]);

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

  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  return (
    <div>
      <h3>Multiplayer Chat</h3>
      <div>
        {chatMessages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}</strong>: {msg.message}
          </p>
        ))}
      </div>
      <div>
        <input
          id="message_input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button id="send_message_button" onClick={sendMessage}>
          Send Message
        </button>
      </div>
    </div>
  );
};
export default MultiplayerChat;
