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
  console.log("✅ Connected GraphQL middleware");

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
      console.log(`🔎 Local Server: https://localhost:${PORT}`);
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
