import {GraphQLError} from 'graphql';

/**
 * Throws an error saying it failed to fetch the query.
 *
 * **Made this function to stop having to write this all the time**
 *
 * @param error The error that is thrown that we are catching
 *
 * @param queryName The name of the query. Used in the text of the thrown error
 *
 * @author Thomas Stemler :)
 */
export const GQLQueryError = (queryName: string, error: any) => {
  return new GraphQLError(`Failed to fetch ${queryName}`, {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      originalError: error
    }
  });
}