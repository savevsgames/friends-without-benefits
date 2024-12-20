import {Game, User} from '../models/index.js'
import {GQLMutationError, GQLQueryError} from "../utils/graphQLErrorThrower.js";

import bcrypt from 'bcrypt';

const resolvers = {
  Query: {
    // querying all users
    users: async () => {
      try {
        return await User.find({})
          .populate('friends')
          .populate('shortestRound');
      } catch (error) {
        throw GQLQueryError('users', error);
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
              as: "shortestRound"
            }
          },
          {
            $unwind: "$shortestRound" // Unwind the shortestRound array
          },
          {
            $sort: {
              "shortestRound.duration": 1 // Sort by the Game's duration
            }
          },
          {
            $limit: 10 // Limit to top 10 users
          },
          {
            $project: {
              username: 1,
              email: 1,
              "shortestRound.duration": 1 // Include only relevant fields
            }
          }
        ]);
      } catch (error) {
        throw GQLQueryError("top ten users", error);
      }
    },
    // Querying all games
    games: async () => {
      try {
        return await Game.find({})
          .populate('author')
          .populate('challengers')
          .populate('winner');
      } catch (error) {
        throw GQLQueryError('games', error);
      }
    }
  },
  Mutation: {
    addUser: async (_: any, {input}: any) => {
      const {username, email, password} = input;

      try {
        // Check if the email is already in use
        const existingUser = await User.findOne({email});
        if (existingUser) {
          throw new Error('Email already in use');
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
        throw GQLMutationError('addUser', error);
      }
    },
    addFriend: async (_: any, {input}: any) => {
      const {userID, friendID} = input;

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
        await User.findByIdAndUpdate(userID, {$push: {friends: friendID}});
        await User.findByIdAndUpdate(friendID, {$push: {friends: userID}});

        return {
          success: true,
          message: `Successfully added ${friend.username} as a friend!`,
        };
      } catch (error) {
        throw GQLMutationError('addFriend', error);
      }
    },
  }
};

export default resolvers;