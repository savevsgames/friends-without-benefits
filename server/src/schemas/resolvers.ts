import { Game, User, Player } from "../models/index.js";
import {
  GQLMutationError,
  GQLQueryError,
} from "../utils/graphQLErrorThrower.js";

import bcrypt from "bcrypt";

// Define the shape of the Player object passed as 'parent' in the Player resolver
type IPlayerParent = {
  user: string; // MongoDB ObjectId stored as a string
  score: number;
  isReady: boolean;
  isHost?: boolean;
};

const resolvers = {
  Query: {
    // querying all users
    users: async () => {
      try {
        return await User.find({})
          .populate("friends")
          .populate("shortestRound");
      } catch (error) {
        throw GQLQueryError("users", error);
      }
    },
    // querying the top ten users with the shortest rounds
    topTen: async () => {
      try {
        // Aggregation pipeline
        return await User.aggregate([
          {
            $lookup: {
              from: "games", // MongoDB collection for the Game model
              localField: "shortestRound",
              foreignField: "_id",
              as: "shortestRound",
            },
          },
          {
            $unwind: "$shortestRound", // Unwind the shortestRound array
          },
          {
            $sort: {
              "shortestRound.duration": 1, // Sort by the Game's duration
            },
          },
          {
            $limit: 10, // Limit to top 10 users
          },
          {
            $project: {
              username: 1,
              email: 1,
              "shortestRound.duration": 1, // Include only relevant fields
            },
          },
        ]);
      } catch (error) {
        throw GQLQueryError("top ten users", error);
      }
    },
    // Querying all games
    games: async () => {
      try {
        const games = await Game.find({}).populate("author").populate("winner");

        // Populate the user data for each challenger
        for (let game of games) {
          await Promise.all(
            game.challengers.map(async (challenger) => {
              const userData = await User.findById(challenger.userId);
              challenger.user = userData; // This line seems wrong - i want to populate the challenger with the userId on creation, score - 0, isReady - false, isHost - false
            })
          );
        }
        return games;
      } catch (error) {
        throw GQLQueryError("games", error);
      }
    },

    players: async () => {
      try {
        return await Player.find({}).populate("user");
      } catch (error) {
        throw GQLQueryError("players", error);
      }
    },
  },

  Player: {
    user: async (parent: IPlayerParent) => {
      try {
        return await User.findById(parent.user);
      } catch (error) {
        throw GQLQueryError("Player.user", error);
      }
    },
  },

  Mutation: {
    addUser: async (_: any, { input }: any) => {
      const { username, email, password } = input;

      try {
        // Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("Email already in use");
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({
          username,
          email,
          password: hashedPassword,
        });

        return newUser;
      } catch (error) {
        throw GQLMutationError("addUser", error);
      }
    },
    addFriend: async (_: any, { input }: any) => {
      const { userID, friendID } = input;

      try {
        // Check if the user and friend exist
        const user = await User.findById(userID);
        const friend = await User.findById(friendID);

        if (!user) {
          return {
            success: false,
            message: `User: ${userID} does not exist`,
          };
        } else if (!friend) {
          return {
            success: false,
            message: `User: ${friendID} does not exist`,
          };
        }

        // Check if the friend is already in the user's friends list
        if (user.friends.includes(friendID)) {
          return {
            success: false,
            message: `Users are already friends`,
          };
        }

        // Update both users' friends lists
        await User.findByIdAndUpdate(userID, { $push: { friends: friendID } });
        await User.findByIdAndUpdate(friendID, { $push: { friends: userID } });

        return {
          success: true,
          message: `Successfully added ${friend.username} as a friend!`,
        };
      } catch (error) {
        throw GQLMutationError("addFriend", error);
      }
    },
    createGame: async (_: any, { input }: any) => {
      const { authorId, challengerIds, items } = input;

      try {
        const author = await User.findById(authorId);
        if (!author) {
          throw new Error(`User with ID: ${authorId} does not exist`);
        }

        // Create challenger objects as subdocuments
        const challengers = [];
        if (challengerIds && challengerIds.length > 0) {
          for (const userId of challengerIds) {
            const user = await User.findById(userId);
            if (!user) {
              throw new Error(`User with ID: ${userId} does not exist`);
            }

            challengers.push({
              userId: userId,
              score: 0,
              isReady: false,
              isHost: false,
            });
          }
        }

        // Create the Game with embedded challengers
        const game = await Game.create({
          author: author._id,
          challengers: challengers,
          duration: 0,
          isComplete: false,
          itemsFound: 0,
          items: items || [],
          winner: null,
        });

        await game.populate("author");
        await game.populate("winner");

        // Populate user data for each challenger
        for (let challenger of game.challengers) {
          const userData = await User.findById(challenger.userId);
          challenger.user = userData; // This line seems wrong - i want to populate the challenger with the userId on creation, score - 0, isReady - false, isHost - false
        }

        return game;
      } catch (error) {
        throw GQLMutationError("createGame", error);
      }
    },
    updateGame: async (_: any, { input }: any) => {
      const {
        gameId,
        isComplete,
        duration,
        itemsFound,
        winnerId,
        challengers,
      } = input;
      try {
        const game = await Game.findById(gameId);
        if (!game) {
          throw new Error(`Game (id: ${gameId}) not found`);
        }

        if (typeof isComplete === "boolean") {
          game.isComplete = isComplete;
        }
        if (typeof duration === "number") {
          game.duration = duration;
        }
        if (typeof itemsFound === "number") {
          game.itemsFound = itemsFound;
        }
        if (winnerId) {
          const winner = await User.findById(winnerId);
          if (!winner) {
            throw new Error(`User (winnerId: ${winnerId}) not found`);
          }
          game.winner = winnerId;
        }

        await game.save();
        await game.populate("author");
        await game.populate("winner");

        // Populate user data for each challenger
        for (let challenger of game.challengers) {
          const userData = await User.findById(challenger.userId);
          //
          challenger.user = userData;
        }

        return game;
      } catch (error) {
        throw GQLMutationError("updateGame", error);
      }
    },
    // Not sure i need this anymore? if Players are subdocuments of Game then i should be able to create them when creating a game
    // I will need to be able to update the challenger's score and isReady properties after the game has been created though
    createPlayer: async (_: any, { input }: any) => {
      const { userId, score, isReady, isHost } = input;
      try {
        const existingUser = await User.findById(userId);
        if (!existingUser) {
          throw new Error(`User (id: ${userId}) not found`);
        }

        const newPlayer = await Player.create({
          user: userId,
          score: score || 0,
          isReady: isReady ?? false,
          isHost: isHost ?? false,
        });

        return newPlayer.populate("user");
      } catch (error) {
        throw GQLMutationError("createPlayer", error);
      }
    },
  },
};

export default resolvers;
