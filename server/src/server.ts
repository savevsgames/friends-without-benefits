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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();
  await db();

  const PORT = process.env.PORT || 3001;
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use("/graphql", expressMiddleware(server));

  // PEERJS/SOCKET.IO SERVER ADDED TO SAME EXPRESS INSTANCE AS APOLLO SERVER FOR MVP
  // Create an HTTP server instance for PeerJs
  const httpServer = createServer(app);

  // Socket.IO Setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // PeerJS Setup
  const peerServer = ExpressPeerServer(httpServer, {
    path: "/peerjs",
  });
  app.use("/peerjs", peerServer);

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    console.log(`Use PeerJS at http://localhost:${PORT}/peerjs`);
  });
};

startApolloServer();
