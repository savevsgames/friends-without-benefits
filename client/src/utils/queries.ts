import { gql } from "@apollo/client"

// TODO: to be changed if need be, I just needed a placeholder
export const QUERY_ME = gql`
  query me {
    me {
      _id
      username
      email
      avatar
      friends
      createdAt
      shortesRound

    }
  }
`;