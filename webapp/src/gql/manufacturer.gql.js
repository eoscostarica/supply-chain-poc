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

export const MANUFACTURER_BY_ID_QUERY = gql`
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
  mutation($id: uuid!, $name: String!, $data: jsonb!) {
    update_manufacturer_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name, data: $data }
    ) {
      id
    }
  }
`
