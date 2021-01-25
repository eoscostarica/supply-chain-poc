import gql from 'graphql-tag'

export const LOGIN_MUTATION = gql`
  mutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      access_token
      refresh_token
    }
  }
`

export const USERS_QUERY = gql`
  query {
    users: user {
      id
      name
      account
      email
      username
      role
      created_at
      updated_at
    }
  }
`

export const USER_QUERY = gql`
  query($id: uuid!) {
    user: user_by_pk(id: $id) {
      id
      name
      account
      email
      username
      role
      organization {
        id
        name
      }
      created_at
      updated_at
    }
  }
`
