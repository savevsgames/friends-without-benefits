import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation addUser($input: AddUserInput) {
    addUser(input: $input) {
      token
      user {
        username
        _id
        avatar
        email
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        _id
        email
        username
        avatar
        shortestRound {
          duration
        }
      }
    }
  }
`;

export const CREATE_GAME = gql`
  mutation createGame($input: CreateGameInput!) {
    createGame(input: $input) {
      _id
      author {
        _id
        username
      }
      challengers {
        user {
          _id
          username
        }
        score
        isReady
        isHost
      }
      duration
      isComplete
      itemsFound
      items
      winner {
        _id
        username
      }
    }
  }
`;

export const UPDATE_GAME = gql`
  mutation updateGame($input: UpdateGameInput!) {
    updateGame(input: $input) {
      _id
      isComplete
      duration
      itemsFound
      winner {
        _id
        username
      }
      challengers {
        user {
          _id
          username
        }
        score
        isReady
        isHost
      }
    }
  }
`;
