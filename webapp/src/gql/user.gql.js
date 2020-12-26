import gql from 'graphql-tag'

export const LOGIN_MUTATION = gql`
  mutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      access_token
      refresh_token
    }
  }
`

export const USER_LIST_QUERY = gql`
  query {
    users: user {
      id
      name
      account
      email
      username
      created_at
      updated_at
    }
  }
`
