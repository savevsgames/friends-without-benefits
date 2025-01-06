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
import { createSocketManager } from "./socket/index.js";
import type {
  ServerContext,
  UserConnection,
  GameRoom,
} from "./socket/socketTypes.js";

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

  /**
   * Track ready states for players using playerReady and updateReadyStates
   * @type Record<string, boolean>
   * string represents id, boolean is their useMultiplayerGameStore
   * players.Player.isReady state
   */
  // const playerReadyStates: Record<string, boolean> = {};

  // SOCKET.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://friends-without-benefits.onrender.com",
        "https://friends-without-benefits-1.onrender.com",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
    transports: ["polling", "websocket"],
    allowEIO3: true, // Legacy support for older browsers
  });

  // Set up the server context
  const serverContext: ServerContext = {
    io,
    // SocketId -> PeerJS ID mappings for Socket.IO to track connected users
    userConnections: new Map<string, UserConnection>(),
    gameRooms: new Map<string, GameRoom>(),
    numCurrentActiveUsers: 0,
  };

  // Pass the server into the Create Socket Manager
  const socketManager = createSocketManager(serverContext);
  // Let the manager handle all listeners now
  io.on("connection", socketManager.socketConnection);

  // io.on("connection", (socket) => {
  //   console.log("🔗 Socket.IO Connected:", socket.id);

  //   /**
  //    * 🔄 State Update Middleware
  //    * - Listens for state updates from clients.
  //    * - Broadcasts state updates to all other clients (not the sender)
  //    */
  //   socket.on("stateUpdate", ({ store, updates }) => {
  //     // SYNCHRONIZATION MIDDLEWARE - Updates zustand "store" with incoming updates - game or multiplayer
  //     console.log(`Updating the ${store} store with:`, updates);
  //     try {
  //       if (store === "game") {
  //         console.log("🔄 Game State Update:", updates);
  //         socket.broadcast.emit("stateUpdate", { store: "game", updates });
  //       } else if (store === "multiplayer") {
  //         console.log("🔄 Multiplayer State Update:", updates);
  //         socket.broadcast.emit("stateUpdate", {
  //           store: "multiplayer",
  //           updates,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("❗ Error updating state:", error);
  //     }
  //   });

  //   /**
  //    * 🛠️ Chat Messaging Middleware
  //    * - Listens for chat messages from clients.
  //    * - Broadcasts chat messages to all clients to update chat history as single source of truth.
  //    */
  //   socket.on("chat-message", (data) => {
  //     console.log(`💬 Chat message from ${data.sender}: ${data.message}`);

  //     // Send to everyone including the sender - chat component will filter out the sender
  //     io.emit("chat-message", data);
  //   });

  //   /**
  //    * 📡 PeerJS Signalling Middleware
  //    * - Listens for PeerJS events.
  //    * - Broadcasts PeerJS events to all clients.
  //    */
  //   socket.on("registerPeerId", ({ peerId }) => {
  //     // Store the mapping of SocketId -> PeerId to connectedUsers
  //     connectedUsers.set(socket.id, peerId);
  //     console.log(`📹 Peer Registered: ${peerId} by Socket: ${socket.id}`);
  //     socket.broadcast.emit("peer-registered", { peerId, socketId: socket.id });
  //   });

  //   /**
  //    * 🔍 Opponent ID Request Middleware
  //    * - Listens for requests for an opponent ID.
  //    * - Responds with the first available opponent ID.
  //    */
  //   socket.on("requestOpponentId", ({ from }) => {
  //     console.log(`🔍 Opponent ID requested by: ${from}`);
  //     // Find the first available opponent - later we can implement an
  //     // array where all connected users and loop through them
  //     console.log("Connected Users", connectedUsers);
  //     const opponent = Array.from(connectedUsers.entries()).find(
  //       // Find a key-value pair that is not the user's own socket.id
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //       ([key, _value]) => key !== socket.id
  //     );

  //     if (opponent) {
  //       const [socketId, peerId] = opponent;
  //       socket.emit("opponentId", { opponentId: peerId });
  //       console.log(`📤 Sent opponentId: ${peerId} to ${from}`);
  //       console.log("socket ID", socketId);
  //     } else {
  //       console.warn("❗ No opponent available");
  //       socket.emit("opponentId", { opponentId: null });
  //     }
  //   });

  //   // Listen for 'playerReady' event
  //   // Record<string, boolean> = {};
  //   socket.on("playerReady", ({ playerId }) => {
  //     playerReadyStates[playerId] = true;
  //     console.log(`🎯 Player ${playerId} is ready.`);

  //     // Check if all players are ready / all values of the records are true
  //     const allPlayersReady = Object.values(playerReadyStates).every(
  //       (ready) => ready === true
  //     );

  //     if (allPlayersReady) {
  //       console.log("✅ All players are ready. Starting 5-second countdown.");
  //       // Emit only the number of seconds to start the countdown
  //       // This is where the countdown time can be adjusted - 5s for now
  //       io.emit("startCountdown", 5);
  //     }

  //     // Broadcast updated ready states to all clients
  //     io.emit("updateReadyStates", playerReadyStates);
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("❌ Socket.IO Disconnected:", socket.id);
  //     // Clean up connectedUsers map
  //     connectedUsers.delete(socket.id);
  //     delete playerReadyStates[socket.id];
  //     // Notify all clients that a peer has disconnected
  //     socket.broadcast.emit("peer-disconnected", { socketId: socket.id });
  //   });
  // });

  // PEERJS
  const peerServer = ExpressPeerServer(httpServer, {
    path: "/", // internally = "/peerjs/" within Express
    allow_discovery: true,
    proxied: true,
  });
  app.use("/peerjs", peerServer);

  peerServer.on("connection", (client) => {
    console.log("🔗 PeerJS Connected:", client.getId());
  });

  peerServer.on("disconnect", (client) => {
    console.log("❌ PeerJS Disconnected:", client.getId());
  });

  // Serve the client build in production
  if (process.env.NODE_ENV !== "development") {
    // Serve static files from the client build directory
    app.use(express.static(path.resolve(__dirname, "../../client/dist")));

    // Catch all other routes and return the index.html file
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, "../../client/dist/index.html"));
    });
  }
  if (process.env.NODE_ENV === "development") {
    // Start the server locally
    httpServer.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🛠️ GraphQL: http://localhost:${PORT}/graphql`);
      console.log(`🔗 Socket.IO: http://localhost:${PORT}/socket.io`);
      console.log(`🔗 PeerJS: http://localhost:${PORT}/peerjs`);
    });
  } else {
    // Start the server on Render
    httpServer.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(
        `🛠️ GraphQL: https://friends-without-benefits.onrender.com/graphql`
      );
      console.log(
        `🔗 Socket.IO: https://friends-without-benefits.onrender.com/socket.io`
      );
      console.log(
        `🔗 PeerJS: https://friends-without-benefits.onrender.com/peerjs`
      );
    });
  }
};

startApolloServer();
