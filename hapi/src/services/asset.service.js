// TODO: use enum for status
const Boom = require('@hapi/boom')
const { BAD_REQUEST } = require('http-status-codes')

const {
  simpleassetsUtil,
  hasuraUtil,
  rabbitmqUtil,
  eosUtil
} = require('../utils')
const { simpleassetsConfig } = require('../config')

const organizationService = require('./organization.service')
const vaultService = require('./vault.service')
const historyService = require('./history.service')

const find = async (where = {}) => {
  const query = `
  query ($where: asset_bool_exp){
    asset (where: $where) {
      id
      key
      author
      owner
      offered_to
      mdata
      status
    }
  }
  `
  const { asset: data } = await hasuraUtil.request(query, { where })

  return data
}

const findOne = async (where = {}) => {
  const query = `
  query ($where: asset_bool_exp){
    asset (where: $where, limit: 1) {
      id
      key
      idata
      status
      created_at
      updated_at
    }
  }
  `
  const { asset: data } = await hasuraUtil.request(query, { where })

  if (data && data.length > 0) {
    return data[0]
  }

  return null
}

const getNestedIds = async id => {
  try {
    const query = `
      query ($id: uuid!) {
        asset: asset_by_pk(id: $id) {
          id
          category
          assets {
            id
            category
            assets {
              id
              category
              assets {
                id
                category
                assets {
                  id
                  category
                  assets {
                    id
                    category
                  }
                }
              }
            }
          }
        }
      }
    `
    const data = await hasuraUtil.request(query, {
      id
    })

    return getNestedIdsFromAsset(data.asset)
  } catch (error) {
    console.error(error)
  }

  return []
}

const getNestedIdsFromAsset = asset => {
  if (!asset?.assets?.length) {
    return [asset.id]
  }

  const ids = [asset.id]

  for (let index = 0; index < asset.assets.length; index++) {
    ids.push(...getNestedIdsFromAsset(asset.assets[index], [asset.id]))
  }

  return ids
}

const createAssets = async (user, payload, quantity = 1) => {
  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('password not found', {
      statusCode: BAD_REQUEST
    })
  }

  const assets = []

  for (let index = 0; index < quantity; index++) {
    assets.push({
      category: payload.category,
      idata: JSON.stringify(payload.idata || {}),
      author: user.orgAccount,
      owner: user.orgAccount,
      mdata: JSON.stringify(payload.mdata || {}),
      requireclaim: false
    })
  }

  const transaction = await simpleassetsUtil.createSet(
    user.orgAccount,
    password,
    assets
  )

  if (!transaction) {
    throw new Boom.Boom('error creating asset', {
      statusCode: BAD_REQUEST
    })
  }

  const actionTraces = transaction.processed.action_traces.filter(
    item => item.act.name === 'create'
  )

  const newAssets = actionTraces.map(trace => {
    const {
      act: { data: createlogData }
    } = trace.inline_traces.find(action => action.act.name === 'createlog')

    return {
      parent: payload.parent,
      key: createlogData.assetid,
      author: createlogData.author,
      owner: createlogData.owner,
      category: createlogData.category,
      idata: JSON.parse(createlogData.idata),
      mdata: JSON.parse(createlogData.mdata),
      status: payload.status || 'created'
    }
  })

  const mutation = `
    mutation ($assets: [asset_insert_input!]!) {
      assets: insert_asset(objects: $assets) {
        returning {
          id
          key
        }
      }
    }  
  `
  const info = await hasuraUtil.request(mutation, {
    assets: newAssets
  })
  await historyService.createHistory(
    info.assets.returning.map(asset => ({
      action: 'create',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        }
      },
      asset_id: asset.id,
      trxid: transaction.transaction_id
    }))
  )

  return {
    assets: info.assets.returning,
    trxid: transaction.transaction_id
  }
}

const createOffer = async (user, payload) => {
  const organization = await organizationService.findOne({
    id: { _eq: payload.organization }
  })

  if (!organization) {
    throw new Boom.Boom('organization not found', {
      statusCode: BAD_REQUEST
    })
  }

  const assets = await find({
    id: { _in: payload.assets },
    owner: { _eq: user.orgAccount }
  })

  if (!assets?.length) {
    throw new Boom.Boom('assets not found', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('password not found', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.offer(user.orgAccount, password, {
    owner: user.orgAccount,
    newowner: organization.account,
    assetids: assets.map(asset => asset.key),
    memo: payload.memo || ''
  })

  if (!transaction) {
    throw new Boom.Boom('error creating offer', {
      statusCode: BAD_REQUEST
    })
  }

  const mutation = `
    mutation ($keys: [String!]!, $newowner: String!) {
      update_asset(where: {key: {_in: $keys}}, _set: {status: "offer_created", offered_to: $newowner}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutation, {
    keys: assets.map(asset => asset.key),
    newowner: organization.account
  })
  await historyService.createHistory(
    assets.map(asset => ({
      action: 'offer',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        },
        newOwner: {
          name: organization.name,
          account: organization.account
        }
      },
      asset_id: asset.id,
      trxid: transaction.transaction_id
    }))
  )

  return {
    assets: assets.map(({ id, key }) => ({ id, key })),
    trxid: transaction.transaction_id
  }
}

const claimOffer = async (user, payload) => {
  const assets = await find({
    id: { _in: payload.assets },
    offered_to: { _eq: user.orgAccount }
  })

  if (!assets?.length) {
    throw new Boom.Boom('assets not found', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('password not found', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.claim(user.orgAccount, password, {
    claimer: user.orgAccount,
    assetids: assets.map(asset => asset.key)
  })

  if (!transaction) {
    throw new Boom.Boom('error claiming offer', {
      statusCode: BAD_REQUEST
    })
  }

  const ids = []

  for (let index = 0; index < assets.length; index++) {
    const nestedIds = await getNestedIds(assets[index].id)
    ids.push(...nestedIds)
  }

  const mutationUpdateOwner = `
    mutation ($ids: [uuid!]!, $owner: String) {
      update_asset(where: {id: {_in: $ids}}, _set: {owner: $owner}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutationUpdateOwner, {
    ids,
    owner: user.orgAccount
  })

  const mutationUpdateStatus = `
    mutation ($keys: [String!]!, $owner: String) {
      update_asset(where: {key: {_in: $keys}}, _set: {status: "offer_claimed", offered_to: null}) {
        affected_rows
      }
    }  
  `
  await hasuraUtil.request(mutationUpdateStatus, {
    keys: assets.map(asset => asset.key)
  })
  await historyService.createHistory(
    assets.map(asset => ({
      action: 'claim_offer',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        }
      },
      asset_id: asset.id,
      trxid: transaction.transaction_id
    }))
  )

  return {
    assets: assets.map(({ id, key }) => ({ id, key })),
    trxid: transaction.transaction_id
  }
}

const attachAssets = async (user, payload) => {
  const parent = await findOne({
    id: { _eq: payload.parent },
    owner: { _eq: user.orgAccount }
  })

  if (!parent) {
    throw new Boom.Boom('parent not found', {
      statusCode: BAD_REQUEST
    })
  }

  const assets = await find({
    id: { _in: payload.assets },
    owner: { _eq: user.orgAccount }
  })

  if (!assets?.length) {
    throw new Boom.Boom('assets not found', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.attach(user.orgAccount, password, {
    assetidc: parent.key,
    assetids: assets.map(asset => asset.key),
    owner: user.orgAccount
  })

  if (!transaction) {
    throw new Boom.Boom('error attaching assets', {
      statusCode: BAD_REQUEST
    })
  }

  const mutation = `
    mutation ($keys: [String!]) {
      update_asset(where: {key: {_in: $keys}}, _set: {status: "wrapped"}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutation, { keys: assets.map(asset => asset.key) })
  await historyService.createHistory(
    assets.map(asset => ({
      action: 'wrap',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        },
        parent: {
          id: parent.id,
          key: parent.key
        }
      },
      asset_id: asset.id,
      trxid: transaction.transaction_id
    }))
  )
  await historyService.createHistory([
    {
      action: 'attach',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        },
        assets: assets.map(({ id, key }) => ({ id, key }))
      },
      asset_id: parent.id,
      trxid: transaction.transaction_id
    }
  ])

  return {
    assets: assets.map(({ id, key }) => ({ id, key })),
    trxid: transaction.transaction_id
  }
}

// TODO: allow multiple assets
const detachAssets = async (user, payload) => {
  const parent = await findOne({
    id: { _eq: payload.parent },
    owner: { _eq: user.orgAccount }
  })

  if (!parent) {
    throw new Boom.Boom('parent not found', {
      statusCode: BAD_REQUEST
    })
  }

  const assets = await find({
    parent: { _eq: payload.parent },
    owner: { _eq: user.orgAccount }
  })

  if (!assets?.length) {
    throw new Boom.Boom('assets not found', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.detach(user.orgAccount, password, {
    owner: user.orgAccount,
    assetidc: parent.key,
    assetids: assets.map(asset => asset.key)
  })

  if (!transaction) {
    throw new Boom.Boom('error detaching asset', {
      statusCode: BAD_REQUEST
    })
  }

  const mutation = `
    mutation ($keys: [String!]) {
      update_asset(where: {key: {_in: $keys}}, _set: {status: "unwrapped"}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutation, { keys: assets.map(asset => asset.key) })

  const mutationParent = `
    mutation ($key: String!) {
      update_asset(where: {key: {_eq: $key}}, _set: {status: "detached"}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutationParent, { key: parent.key })
  await historyService.createHistory(
    assets.map(asset => ({
      action: 'unwrap',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        },
        parent: {
          id: parent.id,
          key: parent.key
        }
      },
      asset_id: asset.id,
      trxid: transaction.transaction_id
    }))
  )
  await historyService.createHistory([
    {
      action: 'detach',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        },
        assets: assets.map(({ id, key }) => ({ id, key }))
      },
      asset_id: parent.id,
      trxid: transaction.transaction_id
    }
  ])

  return {
    assets: assets.map(({ id, key }) => ({ id, key })),
    trxid: transaction.transaction_id
  }
}

const updateAssets = async (user, payload) => {
  const assets = await find({
    id: { _in: payload.assets },
    _or: [
      { owner: { _eq: user.orgAccount } },
      { author: { _eq: user.orgAccount } }
    ]
  })

  if (!assets?.length) {
    throw new Boom.Boom('assets not found', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.update(
    user.orgAccount,
    password,
    assets.map(asset => ({
      author: asset.author,
      owner: asset.owner,
      assetid: asset.key,
      mdata: JSON.stringify({ ...asset.mdata, ...payload.data })
    }))
  )

  if (!transaction) {
    throw new Boom.Boom('error updating assets', {
      statusCode: BAD_REQUEST
    })
  }

  const mutation = `
    mutation ($key: String!, $data: jsonb!) {
      update_asset(where: {key: {_eq: $key}}, _set: {mdata: $data}) {
        affected_rows
      }
    }
  `

  const actionTraces = transaction.processed.action_traces.filter(
    item => item.act.name === 'update'
  )

  for (let index = 0; index < actionTraces; index++) {
    const actionData = actionTraces[index].act.data

    await hasuraUtil.request(mutation, {
      key: actionData.assetid,
      data: JSON.parse(actionData.mdata)
    })
  }

  await historyService.createHistory(
    assets.map(asset => ({
      action: payload.type,
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        },
        ...payload.data
      },
      asset_id: asset.id,
      trxid: transaction.transaction_id
    }))
  )

  return {
    assets: assets.map(({ id, key }) => ({ id, key })),
    trxid: transaction.transaction_id
  }
}

const burn = async (user, payload, status = 'burned') => {
  const assets = await find({
    id: { _in: payload.assets },
    _or: [
      { owner: { _eq: user.orgAccount } },
      { author: { _eq: user.orgAccount } }
    ]
  })

  if (!assets?.length) {
    throw new Boom.Boom('assets not found', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.burn(user.orgAccount, password, {
    owner: user.orgAccount,
    assetids: assets.map(asset => asset.key),
    memo: payload.description
  })

  if (!transaction) {
    throw new Boom.Boom('error burning assets', {
      statusCode: BAD_REQUEST
    })
  }

  const mutation = `
    mutation ($ids: [uuid!]!, $status: String!) {
      update_asset(where: {id: {_in: $ids}}, _set: {status: $status}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutation, {
    ids: payload.assets,
    status
  })
  await historyService.createHistory(
    assets.map(asset => ({
      action: 'burn',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        },
        description: payload.description
      },
      asset_id: asset.id,
      trxid: transaction.transaction_id
    }))
  )

  return {
    assets: assets.map(({ id, key }) => ({ id, key })),
    trxid: transaction.transaction_id
  }
}

const createNonTransferableToken = async (user, payload, quantity = 1) => {
  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('password not found', {
      statusCode: BAD_REQUEST
    })
  }

  const assets = []

  for (let index = 0; index < quantity; index++) {
    assets.push({
      category: payload.category,
      idata: JSON.stringify(payload.idata || {}),
      author: user.orgAccount,
      owner: payload.owner,
      mdata: JSON.stringify(payload.mdata || {}),
      requireclaim: false
    })
  }

  const transaction = await simpleassetsUtil.createntt(
    user.orgAccount,
    password,
    assets
  )

  if (!transaction) {
    throw new Boom.Boom('error creating ntt', {
      statusCode: BAD_REQUEST
    })
  }

  const actionTraces = transaction.processed.action_traces.filter(
    item => item.act.name === 'createntt'
  )
  const newAssets = actionTraces.map(trace => {
    const {
      act: { data: createlogData }
    } = trace.inline_traces.find(action => action.act.name === 'createnttlog')

    return {
      key: createlogData.assetid,
      author: createlogData.author,
      owner: createlogData.owner,
      category: createlogData.category,
      idata: JSON.parse(createlogData.idata),
      mdata: JSON.parse(createlogData.mdata),
      status: 'created'
    }
  })

  const mutation = `
    mutation ($assets: [asset_insert_input!]!) {
      assets: insert_asset(objects: $assets) {
        returning {
          id
          key
        }
      }
    }  
  `
  const info = await hasuraUtil.request(mutation, {
    assets: newAssets
  })

  return {
    assets: info.assets.returning,
    trxid: transaction.transaction_id
  }
}

const updateStatus = async (id, status) => {
  const mutation = `
    mutation ($id: uuid!, $status: String!) {
      update_asset_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
        id
      }
    }
  `
  await hasuraUtil.request(mutation, {
    id,
    status
  })
}

const sendAssetsToQueue = async (user, payload, quantity) => {
  const maxAllowedItems = simpleassetsConfig.maxAllowedAssetsPerTransaction
  let sentItems = 0

  while (sentItems < quantity) {
    const diff = quantity - sentItems
    const itemsInProgress = diff >= maxAllowedItems ? maxAllowedItems : diff
    await rabbitmqUtil.sendToQueue({
      user,
      payload,
      quantity: itemsInProgress
    })
    sentItems += itemsInProgress
    console.log(`added ${sentItems} to queue of ${quantity}`)
  }
}

const processAssetsFromQueue = async ({ user, payload, quantity = 1 }) => {
  console.log(
    `received ${quantity} ${payload.category} assets to process from queue`
  )
  const { assets } = await createAssets(
    user,
    {
      parent: payload.parent,
      category: payload.category,
      idata: payload.idata,
      mdata: payload.mdata,
      status: payload.status
    },
    quantity
  )

  if (payload.parent && (!payload.childs || !payload.mdata?.childs)) {
    await attachAssets(user, {
      parent: payload.parent,
      assets: assets.map(asset => asset.id)
    })
    await syncStatus(user, payload.parent)

    return
  }

  if (!payload.childs || !payload.mdata?.childs) {
    return
  }

  for (let index = 0; index < assets.length; index++) {
    await sendAssetsToQueue(
      user,
      {
        parent: assets[index].id,
        category: payload.childs.category,
        idata: {
          ...(payload.childs.idata || {}),
          [payload.category]: assets[index].key
        },
        mdata: payload.childs.mdata,
        status: payload.childs.status
      },
      payload?.mdata?.childs
    )
  }
}

const syncStatus = async (user, id) => {
  const query = `
    query ($id: uuid!) {
      asset: asset_by_pk(id: $id) {
        id
        key
        mdata
        parent
        assets: assets_aggregate(where: {status: {_eq: "wrapped"}}) {
          info: aggregate {
            count
          }
        }
      }
    }  
  `
  const { asset } = await hasuraUtil.request(query, { id })

  if (asset?.mdata?.childs !== asset?.assets?.info.count) {
    return
  }

  if (!asset.parent) {
    await updateStatus(id, 'created')

    return
  }

  await attachAssets(user, {
    parent: asset.parent,
    assets: [asset.id]
  })

  await syncStatus(user, asset.parent)
}

module.exports = {
  find,
  findOne,
  createAssets,
  createOffer,
  claimOffer,
  attachAssets,
  detachAssets,
  updateAssets,
  burn,
  createNonTransferableToken,
  updateStatus,
  sendAssetsToQueue,
  processAssetsFromQueue
}
