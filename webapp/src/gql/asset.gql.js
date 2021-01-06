import gql from 'graphql-tag'

const ORDER_QUERY_BODY = `assets {
  category
  key
  idata
  asset {
    idata
  }
  assets {
    category
    key
    idata
    asset {
      idata
    }
    assets {
      key
      category
      idata
      asset {
        idata
      }
      assets {
        key
        category
        idata
        asset {
          idata
        }
        assets {
          key
          category
          idata
          asset {
            idata
          }
        }
      }
    }
  }
}`

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
      key
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
      vaccines: $vaccines
    ) {
      id
      key
      trxid
    }
  }
`

export const CREATE_OFFER_MUTATION = gql`
  mutation($assets: [String!]!, $organization: String!, $memo: String) {
    offer: create_offer(
      assets: $assets
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
    assets: asset(where: { status: { _in: $status } }, order_by: { key: asc }) {
      id
      key
      category
      idata
      mdata
      author
      owner
      offered_to
      status
      assets: assets_aggregate(where: { status: { _eq: "wrapped" } }) {
        info: aggregate {
          count
        }
      }
      created_at
      updated_at
    }
  }
`

export const ASSETS_BY_ORDER_ID = gql`
  query($orderId: uuid!) {
    asset(where: { id: { _eq: $orderId } }) {
      id
      key
      created_at
      updated_at
      ${ORDER_QUERY_BODY}
    }
  }
`

export const CONTAINER_ASSETS_BY_ID = gql`
  query($id: uuid!) {
    asset(
      where: {
        _and: [{ category: { _eq: "container" } }, { id: { _eq: $id } }]
      }
    ) {
      category
      key
      id
      asset {
        category
        key
        id
        asset {
          category
          key
          id
          asset {
            category
            key
            id
            asset {
              id
              key
              category
              idata
              mdata
              offered_to
              status
              ${ORDER_QUERY_BODY}
              created_at
              updated_at
            }
          }
        }
      }
    }
  }
`

export const WRAPPER_ASSETS_BY_ID = gql`
query ($id: uuid!) {
  asset(where: {_and: [{category: {_eq: "wrapper"}}, {id: {_eq: $id}}]}) {
    category
    key
    id
    asset {
      category
      key
      id
      asset {
        category
        key
        id
        asset {
          id
          key
          category
          idata
          mdata
          offered_to
          status
          ${ORDER_QUERY_BODY}
          created_at
          updated_at
        }
      }
    }
  }
}
`

export const BOX_ASSETS_BY_ID = gql`
query($id: uuid!) {
  asset(
    where: { _and: [{ category: { _eq: "box" } }, { id: { _eq: $id } }] }
  ) {
    category
    id
    key
    asset {
      category
      id
      key
      asset {
        id
        key
        category
        idata
        mdata
        offered_to
        status
        ${ORDER_QUERY_BODY}
        created_at
        updated_at
      }
    }
  }
}
`

export const BATCH_ASSETS_BY_ID = gql`
  query($id: uuid!) {
    asset(
      where: { _and: [{ category: { _eq: "batch" } }, { id: { _eq: $id } }] }
    ) {
      category
      key
      id
      idata
      asset {
        id
        key
        category
        idata
        mdata
        offered_to
        status
        ${ORDER_QUERY_BODY}
        created_at
        updated_at
      }
    }
  }
`

export const QUERY_BATCH_ASSET = gql`
  query($where: jsonb) {
    batch: asset(where: { idata: { _contains: $where } }) {
      id
      idata
      order: asset {
        idata
      }
    }
  }
`
