// This file is set to use my instance of MongoDB Atlas to seed data into my local db for multiplayer testing.
import mongoose from "mongoose";
import User from "../models/User.js";
import Game from "../models/Game.js";
import Player from "../models/Player.js";
import dotenv from "dotenv";

dotenv.config();

// Add your MongoDB URI for testing to env with console or .env file
const MONGODB_URI_MPTESTING = process.env.MONGODB_URI_MPTESTING;

const db = async () => {
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

const seed = async () => {
  try {
    await db();

    // 1) Clear existing data
    await User.deleteMany({});
    await Player.deleteMany({});
    await Game.deleteMany({});

    // 2) Create two test users
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
    console.log("✅ Created users:", userA.username, "and", userB.username);

    // Create Player docs referencing userA, userB
    // UserA will be the host, userB be the challenger
    const playerA = await Player.create({
      user: userA._id,
      score: 0,
      isReady: true,
      isHost: true,
    });

    const playerB = await Player.create({
      user: userB._id,
      score: 0,
      isReady: false,
      isHost: false,
    });
    console.log("✅ Created player docs for userA, userB");

    // Create a Game referencing userA as author, and push player ids to challengers []
    const testGame = await Game.create({
      author: userA._id,
      challengers: [playerA._id, playerB._id], // CHANGED: store Player _ids
      duration: 0,
      isComplete: false,
      itemsFound: 0,
      items: ["item1", "item2"],
      // Change to null if game must be incomplete for test to work - but for now
      // using winner will let me log the full game object to see if it's working as expected
      winner: userA._id,
    });

    console.log("✅ Created game with challengers:", testGame.challengers);

    console.log("✅ Seed data inserted successfully!");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  } finally {
    await mongoose.connection.close();
    console.log("✅ DB connection closed (seed script).");
  }
};

seed();
