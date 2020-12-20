import gql from 'graphql-tag'

export const CREATE_ORDER_MUTATION = gql`
  mutation(
    $manufacturer: String!
    $product: String!
    $quantity: Float!
    $type: String!
  ) {
    order: create_order(
      manufacturer: $manufacturer
      product: $product
      quantity: $quantity
      type: $type
    ) {
      id
      trxid
    }
  }
`

export const CREATE_BATCH_MUTATION = gql`
  mutation(
    $order: String!
    $lot: String!
    $exp: String!
    $quantity: Float!
    $type: String!
  ) {
    batch: create_batch(
      order: $order
      lot: $lot
      exp: $exp
      quantity: $quantity
      type: $type
    ) {
      id
      trxid
    }
  }
`

export const ASSETS_BY_STATUS_QUERY = gql`
  query($status: String!) {
    assets: asset(where: { status: { _eq: $status } }) {
      id
      key
      category
      idata
      mdata
      status
      created_at
      updated_at
    }
  }
`
