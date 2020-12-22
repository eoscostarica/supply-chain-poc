import gql from 'graphql-tag'

export const CREATE_ORDER_MUTATION = gql`
  mutation(
    $manufacturer: String!
    $product: String!
    $vaccines: Float!
    $type: String!
  ) {
    order: create_order(
      manufacturer: $manufacturer
      product: $product
      vaccines: $vaccines
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
    $boxes: Float!
    $wrappers: Float!
    $containers: Float!
    $vaccines: Float!
  ) {
    batch: create_batch(
      order: $order
      lot: $lot
      exp: $exp
      boxes: $boxes
      wrappers: $wrappers
      containers: $containers
      vaccines: $containers
    ) {
      id
      trxid
    }
  }
`

export const CREATE_OFFER_MUTATION = gql`
  mutation($asset: String!, $organization: String!, $memo: String) {
    offer: create_offer(
      asset: $asset
      organization: $organization
      memo: $memo
    ) {
      trxid
    }
  }
`

export const ASSETS_BY_STATUS_QUERY = gql`
  query($status: [String!]) {
    assets: asset(where: { status: { _nin: $status } }) {
      id
      key
      category
      idata
      mdata
      offered_to
      status
      created_at
      updated_at
    }
  }
`
