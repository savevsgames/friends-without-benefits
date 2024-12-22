import { gql } from '@apollo/client';

export const ADD_USER = gql`
mutation addUser($userInput: UserInput!) {
addUser (userInput: $userInput) {
}
}
`;

export const LOGIN_USER = gql`
    mutation loginUser($email: String!, $password: String) {
    login(email: $email, password: $password) {
}
    }
`;