import gql from 'graphql-tag'

export const MANUFACTURER_QUERY = gql`
  query {
    manufacturers: manufacturer {
      id
      name
      products {
        id
        name
        types
      }
    }
  }
`
