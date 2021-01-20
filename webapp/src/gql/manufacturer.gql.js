import gql from 'graphql-tag'

export const MANUFACTURERS_QUERY = gql`
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

export const MANUFACTURER_QUERY = gql`
  query($id: uuid!) {
    manufacturer: manufacturer_by_pk(id: $id) {
      id
      name
      data
      products {
        id
        name
        types
      }
      updated_at
    }
  }
`

export const MANUFACTURER_UPDATE_MUTATION = gql`
  mutation($id: uuid!, $name: String!, $data: jsonb) {
    manufacturer: update_manufacturer_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name, data: $data }
    ) {
      id
    }
  }
`

export const MANUFACTURER_INSERT_MUTATION = gql`
  mutation($name: String!, $data: jsonb) {
    manufacturer: insert_manufacturer_one(
      object: { name: $name, data: $data }
    ) {
      id
    }
  }
`
