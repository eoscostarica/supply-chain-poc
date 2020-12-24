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
      key
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
      key
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

export const CLAIM_OFFER_MUTATION = gql`
  mutation($assets: [String!]!) {
    claim: claim_offer(assets: $assets) {
      trxid
    }
  }
`

export const DETACH_ASSETS_MUTATION = gql`
  mutation($parent: String!) {
    detach: detach_assets(parent: $parent) {
      trxid
    }
  }
`

export const UPDATE_ASSETS_MUTATION = gql`
  mutation($type: String!, $assets: [String!]!, $data: jsonb!) {
    update: update_assets(type: $type, assets: $assets, data: $data) {
      trxid
    }
  }
`

export const ASSETS_BY_STATUS_QUERY = gql`
  query($status: [String!]) {
    assets: asset(
      where: { status: { _nin: $status } }
      order_by: { key: asc }
    ) {
      id
      key
      category
      idata
      mdata
      owner
      offered_to
      status
      assets: assets_aggregate(where: { status: { _eq: "attached" } }) {
        info: aggregate {
          count
        }
      }
      created_at
      updated_at
    }
  }
`
