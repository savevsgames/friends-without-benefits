import { gql } from "@apollo/client";

export const ADD_USER = gql`
mutation addUser($userInput: UserInput!) {
addUser (userInput: $userInput) {
    token
    user {
        _id
        email
        username    
    }
}}
`;

export const LOGIN_USER = gql`
    mutation loginUser($email: String!, $password: String) {
    login(email: $email, password: $password) {
        token
        user {
        username
        password
        email
        _id
        }
    }
}
`;
