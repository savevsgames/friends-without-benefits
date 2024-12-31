import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation addUser($userInput: UserInput!) {
    addUser(userInput: $userInput) {
      token
      user {
        _id
        email
        username
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        _id
        email
        username
      }
    }
  }
`;
