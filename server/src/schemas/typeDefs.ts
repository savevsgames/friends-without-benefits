const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    friends: [User]
    shortestRound: Game
  }
  
  type Game {
    _id: ID!
    author: User!
    challengers: [User]
    duration: Float
    isComplete: Boolean!
    itemsFound: Int
    items: [String]
    winner: User
  }
  
  type UserContext {
    username: String!
    email: String!
    password: String!
  }
  
  type Auth {
    token: ID!
    user: User
  }
  
  type ShortestRounds {
    users: [User]
  }
  
  type Query {
    users: [User]
    games: [Game]
    
  }
`

export default typeDefs
