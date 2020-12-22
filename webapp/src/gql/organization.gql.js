import gql from 'graphql-tag'

export const ORGANIZATION_QUERY = gql`
  query($account: String) {
    organizations: organization(where: { account: { _neq: $account } }) {
      id
      name
      account
    }
  }
`
