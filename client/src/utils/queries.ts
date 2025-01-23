import {gql} from "@apollo/client"

export const QUERY_ME = gql`
    query me {
  me {
    _id
    username
    email
    avatar
    shortestRound {
      duration
      challengers {
        user {
          username
        }
      }
    }
  }
}
`;

export const QUERY_TOP_TEN = gql`
    query TopTen {
        topTen {
            username
            shortestRound {
                duration
                challengers {
                    user {
                        username
                    }
                }
            }
        }
    }
`