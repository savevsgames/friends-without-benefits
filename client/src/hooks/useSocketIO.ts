import { useEffect } from "react";
import { useGameStore } from "@/store";
import { useMultiplayerStore } from "@/store";
import io from "socket.io-client";
import type { IGameState } from "@/store";
import type { IMultiplayerState } from "@/store";

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
    // Update the store with the instance
    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("✅ Socket.IO Connected:", socketIo.id);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketIo.on("disconnect", (reason: any) => {
      console.log("❌ Socket.IO Disconnected", reason);
    });

    // Listen for state updates to either game or multiplayer store
    socketIo.on(
      "stateUpdate",
      ({
        store,
        updates,
      }: {
        store: "game" | "multiplayer";
        updates: Partial<IGameState | IMultiplayerState>;
      }) => {
        if (store === "game") {
          console.log(`🔄 Incoming GameStore Update (${store}):`, updates);
          useGameStore
            .getState()
            .incomingUpdate(updates as Partial<IGameState>);
        } else if (store === "multiplayer") {
          console.log(
            `🔄 Incoming MultiplayerStore Update (${store}):`,
            updates
          );
          useMultiplayerStore
            .getState()
            .incomingUpdate(updates as Partial<IMultiplayerState>);
        }
      }
    );

    // Listen for chat messages
    socketIo.on("chat-message", (data: { sender: string; message: string }) => {
      console.log("💬 Chat Message Received:", data);
      useMultiplayerStore.getState().addChatMessage(data);
    });

    socketIo.on("connect_error", (error: Error) => {
      console.error("❗ Socket.IO Connection Error:", error.message);
    });

    socketIo.on("reconnect_attempt", () => {
      console.warn("🔄 Socket.IO Reconnecting...");
    });

    return () => {
      socketIo.off("connect");
      socketIo.off("disconnect");
      socketIo.off("stateUpdate");
      socketIo.off("chat-message");
      socketIo.disconnect();
    };
  }, [setSocket, isDevelopment]);
};
