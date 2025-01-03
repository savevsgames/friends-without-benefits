import express from "express";
import path from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { Request, Response } from "express";
import db from "./config/connection.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index.js";
// import { authenticateToken } from './utils/auth.js';
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "node:http";
import { ExpressPeerServer } from "peer";
import cors from "cors";
import { authenticateToken } from "./utils/auth.js";

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Apollo Server Initialization
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await apolloServer.start();
  await db();

  const PORT = process.env.PORT || 3001;
  const app = express();

  // Middleware
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(
    cors({
      origin: "*", // TODO: for dev -> wildcard
      credentials: true,
    })
  );

  // GraphQL
  app.use(
    "/graphql",
    expressMiddleware(apolloServer as any, {
      context: authenticateToken as any,
    })
  );

  // Create HTTP Server
  const httpServer = createServer(app);

  // SocketId -> PeerJS ID mappings for Socket.IO to track connected users
  const connectedUsers = new Map<string, string>();

  // SOCKET.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // TODO: for dev -> wildcard
      credentials: true,
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log("🔗 Socket.IO Connected:", socket.id);

    /**
     * 🔄 State Update Middleware
     * - Listens for state updates from clients.
     * - Broadcasts state updates to all other clients (not the sender)
     */
    socket.on("stateUpdate", ({ store, updates }) => {
      // SYNCHRONIZATION MIDDLEWARE - Updates zustand "store" with incoming updates - game or multiplayer
      console.log(`Updating the ${store} store with:`, updates);
      try {
        if (store === "game") {
          console.log("🔄 Game State Update:", updates);
          socket.broadcast.emit("stateUpdate", { store: "game", updates });
        } else if (store === "multiplayer") {
          console.log("🔄 Multiplayer State Update:", updates);
          socket.broadcast.emit("stateUpdate", {
            store: "multiplayer",
            updates,
          });
        }
      } catch (error) {
        console.error("❗ Error updating state:", error);
      }
    });

    /**
     * 🛠️ Chat Messaging Middleware
     * - Listens for chat messages from clients.
     * - Broadcasts chat messages to all clients to update chat history as single source of truth.
     */
    socket.on("chat-message", (data) => {
      console.log(`💬 Chat message from ${data.sender}: ${data.message}`);

      // Send to everyone including the sender - chat component will filter out the sender
      io.emit("chat-message", data);
    });

    /**
     * 📡 PeerJS Signalling Middleware
     * - Listens for PeerJS events.
     * - Broadcasts PeerJS events to all clients.
     */
    socket.on("registerPeerId", ({ peerId }) => {
      // Store the mapping of SocketId -> PeerId to connectedUsers
      connectedUsers.set(socket.id, peerId);
      console.log(`📹 Peer Registered: ${peerId} by Socket: ${socket.id}`);
      socket.broadcast.emit("peer-registered", { peerId, socketId: socket.id });
    });

    /**
     * 🔍 Opponent ID Request Middleware
     * - Listens for requests for an opponent ID.
     * - Responds with the first available opponent ID.
     */
    socket.on("requestOpponentId", ({ from }) => {
      console.log(`🔍 Opponent ID requested by: ${from}`);
      // Find the first available opponent - later we can implement an
      // array where all connected users and loop through them
      console.log("Connected Users", connectedUsers);
      const opponent = Array.from(connectedUsers.entries()).find(
        // Find a key-value pair that is not the user's own socket.id
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([key, _value]) => key !== socket.id
      );

      if (opponent) {
        const [socketId, peerId] = opponent;
        socket.emit("opponentId", { opponentId: peerId });
        console.log(`📤 Sent opponentId: ${peerId} to ${from}`);
        console.log("socket ID", socketId);
      } else {
        console.warn("❗ No opponent available");
        socket.emit("opponentId", { opponentId: null });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.IO Disconnected:", socket.id);
      // Clean up connectedUsers map
      connectedUsers.delete(socket.id);
      // Notify all clients that a peer has disconnected
      socket.broadcast.emit("peer-disconnected", { socketId: socket.id });
    });
  });

  // PEERJS
  const peerServer = ExpressPeerServer(httpServer, {
    path: "/", // internally = "/peerjs/" within Express
    allow_discovery: true,
  });
  app.use("/peerjs", peerServer);

  if (process.env.NODE_ENV !== "development") {
    // Serve static files from the client build directory
    app.use(express.static(path.join(__dirname, "../../client/dist")));

    // Catch all other routes and return the index.html file
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
  }

  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🛠️ GraphQL: http://localhost:${PORT}/graphql`);
    console.log(`🔗 Socket.IO: http://localhost:${PORT}/socket.io`);
    console.log(`🔗 PeerJS: http://localhost:${PORT}/peerjs`);
  });
};

startApolloServer();
