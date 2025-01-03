import dotenv from "dotenv";

dotenv.config();
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_URI_MPTESTING = process.env.MONGODB_URI_MPTESTING || "";

const db = async (): Promise<typeof mongoose.connection> => {
  if (!MONGODB_URI || !MONGODB_URI_MPTESTING) {
    throw new Error("Missing MongoDB URI environment variable!");
  }

  try {
    // Changed to TESTING database for multiplayer additions
    if (process.env.NODE_ENV === "production") {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");
    } else {
      await mongoose.connect(MONGODB_URI_MPTESTING);
      console.log("Connected to MongoDB for multiplayer testing");
    }

    return mongoose.connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default db;
