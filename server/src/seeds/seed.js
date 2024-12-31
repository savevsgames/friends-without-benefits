// This file is set to use my instance of MongoDB Atlas to seed data into my local db for multiplayer testing.
import mongoose from "mongoose";
import User from "../models/User.js";
import Game from "../models/Game.js";
import dotenv from "dotenv";

dotenv.config();

// Add your MongoDB URI for testing to env with console or .env file
// The collection name is /FWOBTesting
// COMMAND: node --env-file=../../.env multiplayer-testing.js to run without starting application

const db = async () => {
  const MONGODB_URI_MPTESTING = process.env.MONGODB_URI_MPTESTING;
  if (!MONGODB_URI_MPTESTING) {
    throw new Error("Missing MongoDB URI environment variable!");
  }

  try {
    await mongoose.connect(MONGODB_URI_MPTESTING);
    console.log("✅ Database connected for seeding script.");
    return mongoose.connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

// Seed Data
const seed = async () => {
  try {
    await db();

    // 1️⃣ Clear existing data
    await User.deleteMany({});
    await Game.deleteMany({});
    console.log("✅ Cleared existing Users and Games.");

    // 2️⃣ Create two test users
    const [userA, userB] = await User.create([
      {
        username: "RockemSocketRobby",
        email: "rockemsockemrobby@test.com",
        password: "strongPassword",
      },
      {
        username: "JohnDNSmith",
        email: "jdns@test.com",
        password: "strongerPassword",
      },
    ]);
    console.log(`✅ Created users: ${userA.username} and ${userB.username}`);

    // 3️⃣ Create two single-player games per user
    const singlePlayerGames = await Game.create([
      {
        author: userA._id,
        challengers: [
          {
            user: userA._id,
            score: 10,
            isReady: true,
            isHost: true,
          },
        ],
        duration: 5.5,
        isComplete: true,
        itemsFound: 5,
        items: ["item1", "item2", "item3"],
        winner: userA._id,
      },
      {
        author: userA._id,
        challengers: [
          {
            user: userA._id,
            score: 0,
            isReady: false,
            isHost: true,
          },
        ],
        duration: 0,
        isComplete: false,
        itemsFound: 0,
        items: ["item4", "item5"],
      },
      {
        author: userB._id,
        challengers: [
          {
            user: userB._id,
            score: 15,
            isReady: true,
            isHost: true,
          },
        ],
        duration: 7.2,
        isComplete: true,
        itemsFound: 7,
        items: ["itemA", "itemB", "itemC"],
        winner: userB._id,
      },
      {
        author: userB._id,
        challengers: [
          {
            user: userB._id,
            score: 0,
            isReady: false,
            isHost: true,
          },
        ],
        duration: 0,
        isComplete: false,
        itemsFound: 0,
        items: ["itemD", "itemE"],
      },
    ]);
    console.log(
      "✅ Created 4 single-player games (2 per user).",
      singlePlayerGames
    );

    // 4️⃣ Create two multiplayer games between users
    const multiplayerGames = await Game.create([
      {
        author: userA._id,
        challengers: [
          {
            user: userA._id,
            score: 12,
            isReady: true,
            isHost: true,
          },
          {
            user: userB._id,
            score: 8,
            isReady: true,
            isHost: false,
          },
        ],
        duration: 10.5,
        isComplete: true,
        itemsFound: 8,
        items: ["item1", "item2", "item3"],
        winner: userA._id,
      },
      {
        author: userB._id,
        challengers: [
          {
            user: userA._id,
            score: 0,
            isReady: false,
            isHost: false,
          },
          {
            user: userB._id,
            score: 0,
            isReady: false,
            isHost: true,
          },
        ],
        duration: 0,
        isComplete: false,
        itemsFound: 0,
        items: ["item4", "item5"],
      },
    ]);
    console.log(
      "✅ Created 2 multiplayer games (1 finished, 1 in progress).",
      multiplayerGames
    );

    console.log("✅ Seed data inserted successfully!");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  } finally {
    await mongoose.connection.close();
    console.log("✅ DB connection closed (seed script complete).");
  }
};

seed();
