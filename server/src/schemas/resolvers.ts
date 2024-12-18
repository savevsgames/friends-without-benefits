import { User, Game } from '../models/index.js'
import { GraphQLError } from 'graphql';

const resolvers = {
  Query: {
    users: async () => {
      try {
        return await User.find({})
          .populate('friends')
          .populate('shortestRound');
      } catch (error) {
        throw new GraphQLError('Failed to fetch users', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error
          }
        });
      }
    },
    games: async () => {
      try {
        return await Game.find({})
          .populate('author')
          .populate('challengers')
          .populate('winner');
      } catch (error) {
        throw new GraphQLError('Failed to fetch games', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error
          }
        })
      }
    }
    // auth: async () => {
    //   try {
    //     return await Auth.find({})
    //       .populate('user')
    //   } catch (error) {
    //     throw new GraphQLError('Failed to fetch auth', {
    //       extensions: {
    //         code: 'INTERNAL_SERVER_ERROR',
    //         originalError: error
    //       }
    //     })
    //   }
    // }
  }
};

export default resolvers;