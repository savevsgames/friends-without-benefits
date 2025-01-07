import mongoose from "mongoose";
import User from "../models/User.js";
import Game from "../models/Game.js";
import dotenv from "dotenv";

dotenv.config();

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

// Sample usernames and their corresponding emails
const userSeedData = [
    { username: "SpeedRunner", email: "speed@test.com", password: "password123" },
    { username: "CasualGamer", email: "casual@test.com", password: "password123" },
    { username: "ProPlayer", email: "pro@test.com", password: "password123" },
    { username: "NewbieFinder", email: "newbie@test.com", password: "password123" },
    { username: "ItemHunter", email: "hunter@test.com", password: "password123" },
    { username: "QuickScope", email: "quick@test.com", password: "password123" },
    { username: "TimeWaster", email: "time@test.com", password: "password123" },
    { username: "SpeedDemon", email: "demon@test.com", password: "password123" },
    { username: "ObjectSeeker", email: "seeker@test.com", password: "password123" },
    { username: "RushRunner", email: "rush@test.com", password: "password123" },
    { username: "SlowPoke", email: "slow@test.com", password: "password123" },
    { username: "FastTrack", email: "fast@test.com", password: "password123" }
];

// Sample items that can be found in games
const sampleItems = [
    "Fork", "Remote", "Mug", "Toothbrush", "Headphones"
];

const seed = async () => {
    try {
        await db();

        // Clear existing data
        await User.deleteMany({});
        await Game.deleteMany({});
        console.log("✅ Cleared existing Users and Games.");

        // Create users
        const users = await User.create(userSeedData);
        console.log(`✅ Created ${users.length} users`);

        // Create friend relationships
        for (let i = 0; i < users.length; i++) {
            const friendIndices = new Set();
            const numFriends = Math.floor(Math.random() * 3) + 2;

            while (friendIndices.size < numFriends) {
                const friendIdx = Math.floor(Math.random() * users.length);
                if (friendIdx !== i) {
                    friendIndices.add(friendIdx);
                }
            }

            const friendIds = Array.from(friendIndices).map(idx => users[idx]._id);
            await User.findByIdAndUpdate(users[i]._id, { $push: { friends: { $each: friendIds } } });

            for (const friendId of friendIds) {
                await User.findByIdAndUpdate(friendId, { $addToSet: { friends: users[i]._id } });
            }
        }
        console.log("✅ Created friend relationships");

        // Create various types of games
        const games = [];

        // Single-player games with different durations
        for (const user of users) {
            for (let i = 0; i < 3; i++) {
                const duration = (Math.random() * (120 - 90) + 90); // 1:30 to 2 minutes for complete games

                const numItems = Math.floor(Math.random() * 5) + 3;
                const gameItems = sampleItems
                    .sort(() => 0.5 - Math.random())
                    .slice(0, numItems);

                const game = await Game.create({
                    author: user._id,
                    challengers: [],
                    duration,
                    isComplete: true,
                    itemsFound: Math.floor(Math.random() * numItems) + 1,
                    items: gameItems,
                    winner: user._id
                });
                games.push(game);

                const existingUser = await User.findById(user._id);
                if (existingUser) {
                    if (!existingUser.shortestRound ||
                        // @ts-ignore
                        (await Game.findById(existingUser.shortestRound))?.duration > duration) {
                        await User.findByIdAndUpdate(user._id, { shortestRound: game._id });
                    }
                }
            }

            // Create 1 incomplete game per user
            const incompleteGame = await Game.create({
                author: user._id,
                challengers: [],
                duration: 0,
                isComplete: false,
                itemsFound: 0,
                items: sampleItems.sort(() => 0.5 - Math.random()).slice(0, 5)
            });
            games.push(incompleteGame);
        }

        // Multiplayer games
        for (let i = 0; i < 10; i++) {
            const numPlayers = 2;
            const playerIndices = new Set();
            while (playerIndices.size < numPlayers) {
                playerIndices.add(Math.floor(Math.random() * users.length));
            }

            const players = Array.from(playerIndices).map(idx => users[idx]);
            const isComplete = Math.random() > 0.3;
            const duration = isComplete ? (Math.random() * (120 - 90) + 90) : 0; // 1:30 to 2 minutes for complete games


            const challengers = players.flatMap((player, idx) =>
                idx === 0
                    ? [{
                        user: player._id,
                        score: isComplete ? Math.floor(Math.random() * 50) + 50 : 0,
                        isReady: isComplete || Math.random() > 0.5,
                        isHost: idx === 0
                    }]
                    : []
            );

            const winner = isComplete ? players[Math.floor(Math.random() * players.length)]._id : null;
            const numItems = Math.floor(Math.random() * 5) + 5;

            const game = await Game.create({
                author: players[0]._id,
                challengers,
                duration,
                isComplete,
                itemsFound: isComplete ? Math.floor(Math.random() * numItems) + 1 : 0,
                items: sampleItems.sort(() => 0.5 - Math.random()).slice(0, numItems),
                winner
            });
            games.push(game);
        }

        console.log(`✅ Created ${games.length} games`);
        console.log("✅ Seed data inserted successfully!");

    } catch (err) {
        console.error("❌ Error seeding data:", err);
    } finally {
        await mongoose.connection.close();
        console.log("✅ DB connection closed (seed script complete).");
    }
};

seed();
