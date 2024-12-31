import { gql } from "@apollo/client"

export const QUERY_ME = gql`
  query me {
    me {
      email
      password
      avatar
      username
      _id
      shortestRound {
        duration
      }
    }
  }
`;