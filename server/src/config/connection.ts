import dotenv from "dotenv";

dotenv.config();
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_URI_MPTESTING = process.env.MONGODB_URI_MPTESTING || "";

const db = async (): Promise<typeof mongoose.connection> => {
  console.log("Starting database connection...");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("MONGODB_URI:", process.env.MONGODB_URI);
  console.log("MONGODB_URI_MPTESTING:", process.env.MONGODB_URI_MPTESTING);
  if (!MONGODB_URI || !MONGODB_URI_MPTESTING) {
    throw new Error("Missing MongoDB URI environment variable!");
  }

  try {
    if (process.env.NODE_ENV === "production") {
      if (!MONGODB_URI) {
        throw new Error(
          "Missing MongoDB URI environment variable for production!"
        );
      }
      await mongoose.connect(MONGODB_URI);
      console.log("✅ Connected to MongoDB (Production)");
    } else if (process.env.NODE_ENV === "staging") {
      console.log("✅ Connecting to MongoDB (Staging)");
      if (!MONGODB_URI_MPTESTING) {
        throw new Error(
          "Missing MongoDB URI environment variable for staging!"
        );
      }
      await mongoose.connect(MONGODB_URI_MPTESTING);
      console.log("✅ Connected to MongoDB for Multiplayer Testing (Staging)");
    } else {
      throw new Error(
        "NODE_ENV is not set to a valid value (production or staging)!"
      );
    }

    return mongoose.connection;
  } catch (error: Error | any) {
    console.error("❌ Database connection error:", error.message);
    throw error;
  }
};

export default db;
