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
  
  type MutateResponse {
    success: Boolean!
    message: String
  }
  
  type Query {
    users: [User]
    games: [Game]
    topTen: [User]
  }
  
  type Mutation {
    addUser(input: AddUserInput): User!
    addFriend(input: AddFriendInput): MutateResponse!
  }
  
  input AddUserInput {
    username: String!
    email: String!
    password: String!
  }
  
  input AddFriendInput {
    userID: ID!
    friendID: ID!
  }
`

export default typeDefs
