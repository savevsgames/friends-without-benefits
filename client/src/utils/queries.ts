import {gql} from "@apollo/client"

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