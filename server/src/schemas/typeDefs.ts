const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    friends: [User]
    avatar: String!
    shortestRound: Game
  }

  type Player {
    user: User!
    score: Int!
    isReady: Boolean!
    isHost: Boolean
  }
  
  type Game {
    _id: ID!
    author: User!
    challengers: [Player]
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
    createGame(input: CreateGameInput): Game!
    updateGame(input: UpdateGameInput): Game!
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

  input CreateGameInput {
  authorId: ID!
  challengerIds: [ID!] # array of user IDs
  items: [String]
}

  input UpdateGameInput {
  gameId: ID!
  isComplete: Boolean
  duration: Float
  itemsFound: Int
  winnerId: ID
}
`;

export default typeDefs;
