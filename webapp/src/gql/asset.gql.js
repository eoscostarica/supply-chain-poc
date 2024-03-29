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

export const CREATE_GS1_ASSETS_MUTATION = gql`
  mutation(
    $manufacturer: String!
    $product: String!
    $doses: String!
    $order: String
    $lot: String!
    $exp: String!
    $cases: Float!
    $vaccines: Float!
  ) {
    asset: create_gs1_assets(
      manufacturer: $manufacturer
      product: $product
      doses: $doses
      order: $order
      lot: $lot
      exp: $exp
      cases: $cases
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
  mutation($assets: [String!]!, $action: String!, $payload: jsonb!) {
    update: update_assets(assets: $assets, type: $action, data: $payload) {
      trxid
    }
  }
`

export const ASSETS_BY_STATUS_QUERY = gql`
  query($status: [String!]) {
    assets: asset(
      where: { category: { _neq: "vaccine.cer" }, status: { _in: $status } }
      order_by: { key: asc }
    ) {
      id
      key
      category
      idata
      mdata
      author
      owner
      offered_to
      status
      assets: assets_aggregate(
        where: {
          _or: [{ status: { _eq: "wrapped" } }, { status: { _eq: "creating" } }]
        }
      ) {
        info: aggregate {
          count
        }
      }
      created_at
      updated_at
    }
  }
`

export const ASSET_BY_ID = gql`
  subscription($id: uuid!) {
    asset: asset_by_pk(id: $id) {
      id
      key
      author
      owner
      offered_to
      category
      idata
      mdata
      status
      created_at
      updated_at
      assets {
        id
        key
        category
        idata
        mdata
        status
        assets {
          id
          key
          category
          idata
          mdata
          status
          assets {
            id
            key
            category
            idata
            mdata
            status
            assets {
              id
              key
              category
              idata
              mdata
              status
              assets {
                id
                key
                category
                idata
                mdata
                status
              }
            }
          }
        }
      }
      asset {
        id
        key
        category
        idata
        mdata
        asset {
          id
          key
          category
          idata
          asset {
            id
            key
            category
            idata
            mdata
            asset {
              id
              key
              category
              idata
              mdata
              asset {
                id
                key
                category
                idata
                mdata
              }
            }
          }
        }
      }
    }
  }
`

export const QUERY_PALLET_ASSET = gql`
  query($idata: jsonb, $owner: String!) {
    pallet: asset(
      where: {
        idata: { _contains: $idata }
        assets: {
          assets: {
            category: { _eq: "vaccine" }
            status: { _in: ["unwrapped", "offer_claimed"] }
            owner: { _eq: $owner }
          }
        }
      }
    ) {
      id
      idata
    }
  }
`

export const VACCINATION_MUTATION = gql`
  mutation($person: String!, $lot: String!) {
    vaccination(person: $person, lot: $lot) {
      id
      key
      trxid
      account
    }
  }
`

export const VACCINATION_QUERY = gql`
  query($id: uuid!) {
    vaccination: vaccination_by_pk(id: $id) {
      person {
        name
      }
      created_at
    }
  }
`

export const HISTORY_QUERY = gql`
  query($id: String!) {
    asset_history(id: $id) {
      action
      data
      asset
      trxid
      created_at
    }
  }
`

export const GET_VACCINES = gql`
  query {
    asset(where: { category: { _eq: "vaccine" } }) {
      category
      status
      owner
    }
  }
`
