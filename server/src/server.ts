import express from "express";
import path from "node:path";
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
  app.use("/graphql", expressMiddleware(apolloServer));

  // Create HTTP Server
  const httpServer = createServer(app);

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

    socket.on("disconnect", () => {
      console.log("❌ Socket.IO Disconnected:", socket.id);
    });
  });

  // PEERJS
  const peerServer = ExpressPeerServer(httpServer, {
    path: "/", // internally = "/peerjs/" within Express
    allow_discovery: true,
  });
  app.use("/peerjs", peerServer);

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    // Catch all other routes and return the index file
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
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
