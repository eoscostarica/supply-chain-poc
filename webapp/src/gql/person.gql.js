import gql from 'graphql-tag'

export const PERSON_QUERY = gql`
  query($dni: String) {
    person: person(where: { dni: { _like: $dni } }) {
      id
      dni
      name
      account
    }
  }
`
