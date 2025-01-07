import { Game, User } from "../models/index.js";
import { signToken } from "../utils/auth.js";
import {
  AuthenticationError,
  GQLMutationError,
  GQLQueryError,
} from "../utils/graphQLErrorThrower.js";

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

interface Context {
  user: User;
}

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
        const games = await Game.find({})
          .populate("author")
          .populate("winner")
          .populate("challengers.user");

        return games;
      } catch (error) {
        throw GQLQueryError("games", error);
      }
    },
    me: async (
      _parent: unknown,
      _args: unknown,
      context: Context
    ): Promise<User | null> => {
      if (context.user) {
        // If user is authenticated, return their user data
        return await User.findOne({ _id: context.user._id });
      }
      // If not authenticated, throw an authentication error
      throw AuthenticationError("Not Authenticated");
    },
  },

  Mutation: {
    addUser: async (
      _: any,
      { input }: any
    ): Promise<{ token: string; user: User }> => {
      const { username, email, password } = input;
      console.log("username:", username, "password", password, "email:", email);
      try {
        // Check if the email is already in use

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("Email already in use");
        }

        // Create a new user
        const user = await User.create({
          username,
          email,
          password,
        });
        console.log("new user from addUser is", user);
        const token = signToken(user.username, user.email, user._id);
        console.log("token is from addUser", token);

        return { token, user };
      } catch (error) {
        throw GQLMutationError("addUser", error);
      }
    },
    login: async (
      _parent: unknown,
      { username, password }: { username: string; password: string }
    ): Promise<{ token: string; user: User }> => {
      // find a user by their email
      const user = await User.findOne({ username });

      if (!user) {
        throw AuthenticationError("Failure logging in");
      }

      const correctPw = await user.isCorrectPw(password);
      console.log("the password you entered is:", password);
      console.log("is the password matching the database's?:", correctPw);

      if (!correctPw) {
        throw AuthenticationError("Failure logging in");
      }

      const token = signToken(user.username, user.email, user._id);

      return { token, user };
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
          console.error(`Author with ID: ${authorId} not found`);
          throw new Error(`User with ID: ${authorId} does not exist`);
        }

        // Create challenger objects as subdocuments
        const challengers = [];
        if (challengerIds && challengerIds.length > 0) {
          for (const userId of challengerIds) {
            console.log(`Checking challenger with ID: ${userId}`);
            const userDocument = await User.findById(userId);
            if (!userDocument) {
              console.error(`Challenger with ID: ${userId} not found`);
              throw new Error(`User with ID: ${userId} does not exist`);
            }
            console.log("Challengers prepared:", challengers);

            challengers.push({
              user: userId, // Stored directly on subdocument
              score: 0,
              isReady: false,
              isHost: false,
            });
          }
        }

        // Create the Game with embedded challengers using let so we can populate the user data
        let game = await Game.create({
          author: author._id,
          challengers: challengers,
          duration: 0,
          isComplete: false,
          itemsFound: 0,
          items: items || [],
          winner: null,
        });

        console.log("Game created:", game._id);

        game = await game.populate("author");
        game = await game.populate("winner");
        game = await game.populate("challengers.user");

        console.log("Game populated and returned:", game);

        return game;
      } catch (error) {
        throw GQLMutationError("createGame", error);
      }
    },
    updateGame: async (_: any, { input }: any) => {
      console.log("Incoming updateGame mutation with input:", input);
      try {
        let game = await Game.findById(input.gameId);
        if (!game) {
          console.error(`Game with ID: ${input.gameId} not found`);
          throw new Error(`Game (id: ${input.gameId}) not found`);
        }

        console.log("Game found for update:", game._id);

        if (typeof input.isComplete === "boolean") {
          game.isComplete = input.isComplete;
        }
        if (typeof input.duration === "number") {
          game.duration = input.duration;
        }
        if (typeof input.itemsFound === "number") {
          game.itemsFound = input.itemsFound;
        }
        if (input.challengers && input.challengers.length > 0) {
          game.challengers = input.challengers;
        }
        if (input.winnerId) {
          const winner = await User.findById(input.winnerId);
          if (!winner) {
            console.error(`Winner with ID: ${input.winnerId} not found`);
            throw new Error(`User (winnerId: ${input.winnerId}) not found`);
          }
          game.winner = input.winnerId;
        }

        game = await game.save();
        await game.populate("author");
        await game.populate("winner");
        await game.populate("challengers.user");

        console.log("Game updated:", game._id);
        return game;
      } catch (error) {
        console.error("Error during updateGame mutation:", error);
        throw GQLMutationError("updateGame", error);
      }
    },
  },
};

export default resolvers;
