const { hasuraUtil } = require('../utils')

const createHistory = items => {
  const mutation = `
    mutation ($items: [history_insert_input!]!) {
      insert_history(objects: $items) {
        returning {
          id
        }
      }
    }
  `
  return hasuraUtil.request(mutation, { items })
}

const getHistory = async id => {
  const ids = await getParents(id)
  const query = `
    query ($ids: [uuid!]) {
      history(where: {asset_id: {_in: $ids}, action: {_nin: ["burn", "attach", "wrap", "unwrap"]}}, order_by: {created_at: asc}) {
        action
        data
        trxid
        created_at
        asset {
          id
          key
          category
        }
      }
    }  
  `
  const data = await hasuraUtil.request(query, { ids })

  return data.history
}

const getParents = async id => {
  const query = `
    query ($id: uuid!) {
      assets: asset(where: {id: {_eq: $id}}) {
        id
        asset {
          id
          asset {
            id
            asset {
              id
              asset {
                id
                asset {
                  id
                }
              }
            }
          }
        }
      }
    }  
  `

  const data = await hasuraUtil.request(query, { id })
  const ids = []

  if (!data.assets.length) {
    return ids
  }

  const asset = data.assets[0]
  // vaccine
  ids.push(asset.id)
  // container
  if (asset.asset?.id) {
    ids.push(asset.asset?.id)
  }
  // wrapper
  if (asset.asset?.asset?.id) {
    ids.push(asset.asset?.asset?.id)
  }
  // box
  if (asset.asset?.asset?.asset?.id) {
    ids.push(asset.asset?.asset?.asset?.id)
  }
  // batch
  if (asset.asset?.asset?.asset?.asset?.id) {
    ids.push(asset.asset?.asset?.asset?.asset?.id)
  }
  // order
  if (asset.asset?.asset?.asset?.asset?.asset?.id) {
    ids.push(asset.asset?.asset?.asset?.asset?.asset?.id)
  }

  return ids
}

module.exports = {
  createHistory,
  getHistory
}
