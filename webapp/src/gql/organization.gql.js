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

export const GET_ORGANIZATIONS = gql`
  query {
    organizations: organization {
      account
      created_at
      id
      name
      updated_at
      #data
    }
  }
`

export const GET_ORGANIZATION_BY_ID = gql`
  query($id: uuid) {
    organization(where: { id: { _eq: $id } }) {
      account
      created_at
      id
      name
      #data
      updated_at
      users {
        name
        id
        email
      }
    }
  }
`

export const MUTATION_INSERT_ORGANTIZATION = gql`
  mutation($object: organization_insert_input!) {
    insert_organization_one(object: $object) {
      id
    }
  }
`

export const MUTATION_UPDATE_ORGANIZATION = gql`
  mutation($id: uuid!, $name: String!, $data: jsonb!) {
    update_organization_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name, data: $data }
    ) {
      id
    }
  }
`
