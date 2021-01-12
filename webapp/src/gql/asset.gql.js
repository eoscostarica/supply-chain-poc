import gql from 'graphql-tag'

const NESTED_ASSETS = `
  assets {
    id
    key
    category
    idata
    assets {
      id
      key
      category
      idata
      assets {
        id
        key
        category
        idata
        assets {
          id
          key
          category
          idata
          assets {
            id
            key
            category
            idata
          }
        }
      }
    }
  }
`

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

export const VACCINE_ASSETS_BY_ID = gql`
  query($id: uuid!) {
    asset(
      where: { _and: [{ category: { _eq: "vaccine" } }, { id: { _eq: $id } }] }
    ) {
      id
      key
      category
      idata
      created_at
      updated_at
      container: asset {
        id
        key
        category
        idata
        wrapper: asset {
          id
          key
          category
          idata
          box: asset {
            id
            key
            category
            idata
            batch: asset {
              id
              key
              category
              idata
              order: asset {
                id
                key
                category
                idata
              }
            }
          }
        }
      }
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
      id
      key
      category
      idata
      created_at
      updated_at
      wrapper: asset {
        id
        key
        category
        idata
        box: asset {
          id
          key
          category
          idata
          batch: asset {
            id
            key
            category
            idata
            order: asset {
              id
              key
              category
              idata
            }
          }
        }
      }
      ${NESTED_ASSETS}
    }
  }
`

export const WRAPPER_ASSETS_BY_ID = gql`
  query($id: uuid!) {
    asset(
      where: { _and: [{ category: { _eq: "wrapper" } }, { id: { _eq: $id } }] }
    ) {
      id
      key
      category
      idata
      created_at
      updated_at
      box: asset {
        id
        key
        category
        idata
        batch: asset {
          id
          key
          category
          idata
          order: asset {
            id
            key
            category
            idata
          }
        }
      }
      ${NESTED_ASSETS}
    }
  }
`

export const BOX_ASSETS_BY_ID = gql`
  query($id: uuid!) {
    asset(
      where: { _and: [{ category: { _eq: "box" } }, { id: { _eq: $id } }] }
    ) {
      id
      key
      category
      idata
      created_at
      updated_at
      batch: asset {
        id
        key
        category
        idata
        order: asset {
          id
          key
          category
          idata
        }
      }
      ${NESTED_ASSETS}
    }
  }
`

export const BATCH_ASSETS_BY_ID = gql`
  query($id: uuid!) {
    asset(
      where: { _and: [{ category: { _eq: "batch" } }, { id: { _eq: $id } }] }
    ) {
      id
      key
      category
      idata
      created_at
      updated_at
      order: asset {
        id
        key
        category
        idata
      }
      ${NESTED_ASSETS}
    }
  }
`

export const ORDER_ASSETS_BY_ID = gql`
  query($id: uuid!) {
    asset(where: { id: { _eq: $id }, category: { _eq: "order" } }) {
      id
      key
      category
      idata
      created_at
      updated_at
      ${NESTED_ASSETS}
    }
  }
`

export const QUERY_BATCH_ASSET = gql`
  query($idata: jsonb, $owner: String!) {
    batch: asset(
      where: {
        idata: { _contains: $idata }
        assets: {
          assets: {
            assets: {
              assets: {
                category: { _eq: "vaccine" }
                status: { _eq: "unwrapped" }
                owner: { _eq: $owner }
              }
            }
          }
        }
      }
    ) {
      id
      idata
      order: asset {
        idata
      }
    }
  }
`

export const VACCINATION_MUTATION = gql`
  mutation($person: String!, $batch: String!) {
    vaccination(person: $person, batch: $batch) {
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
