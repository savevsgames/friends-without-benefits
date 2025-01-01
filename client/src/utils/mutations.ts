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
  mutation login($username: String!, $password: String!) {
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
