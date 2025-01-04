import { useEffect } from "react";
import { useMultiplayerStore } from "@/store";
import io from "socket.io-client";

export const useSocketIO = () => {
  const { setSocket } = useMultiplayerStore();

  const isDevelopment = import.meta.env.MODE === "development";

  useEffect(() => {
    const socketIo = isDevelopment
      ? io("http://localhost:3001", {
          path: "/socket.io",
          transports: ["polling", "websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
      : io("https://friends-without-benefits.onrender.com/", {
          // No URL means "connect to the current origin"
          path: "/socket.io",
          transports: ["polling", "websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

    socketIo.on("connect", () => {
      console.log("✅ Socket.IO Connected:", socketIo.id);
      setSocket(socketIo);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketIo.on("disconnect", (reason: any) => {
      console.log("❌ Socket.IO Disconnected", reason);
    });

    socketIo.on("connect_error", (error: Error) => {
      console.error("❗ Socket.IO Connection Error:", error.message);
    });

    socketIo.on("reconnect_attempt", () => {
      console.warn("🔄 Socket.IO Reconnecting...");
    });

    return () => {
      socketIo.disconnect();
    };
  }, [setSocket, isDevelopment]);
};
