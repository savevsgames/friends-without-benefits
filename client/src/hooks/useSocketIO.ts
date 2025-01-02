import { useEffect } from "react";
import { useMultiplayerStore } from "@/store";
import io from "socket.io-client";

export const useSocketIO = () => {
  const { setSocket } = useMultiplayerStore();

  useEffect(() => {
    const socketIo = io("http://localhost:3001", {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    socketIo.on("connect", () => {
      console.log("✅ Socket.IO Connected:", socketIo.id);
      setSocket(socketIo);
    });

    socketIo.on("disconnect", () => {
      console.log("❌ Socket.IO Disconnected");
    });

    socketIo.on("connect_error", (error: Error) => {
      console.error("❗ Socket.IO Connection Error:", error);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [setSocket]);
};
