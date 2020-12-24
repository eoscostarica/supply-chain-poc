const Boom = require('@hapi/boom')
const { BAD_REQUEST } = require('http-status-codes')

const manufacturerService = require('./manufacturer.service')
const organizationService = require('./organization.service')
const productService = require('./product.service')
const vaultService = require('./vault.service')
const { simpleassetsUtil, eosUtil, hasuraUtil } = require('../utils')

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
      status
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
  console.log(asset.id)

  for (let index = 0; index < asset.assets.length; index++) {
    ids.push(...getNestedIdsFromAsset(asset.assets[index], [asset.id]))
  }

  return ids
}

const createAssets = async (user, category, payload, quantity = 1) => {
  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const assets = []

  for (let index = 0; index < quantity; index++) {
    assets.push({
      category,
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
    item => !!item.inline_traces
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
    transaction
  }
}

const attachAssets = async (user, password, { assetidc, assetids }) => {
  await simpleassetsUtil.attach(user.orgAccount, password, {
    assetidc,
    assetids,
    owner: user.orgAccount
  })
  const mutation = `
    mutation ($keys: [String!]) {
      update_asset(where: {key: {_in: $keys}}, _set: {status: "attached"}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutation, { keys: assetids })
}

const detachAssets = async (user, payload) => {
  const parent = await findOne({
    id: { _eq: payload.parent }
  })

  if (!parent) {
    throw new Boom.Boom('error getting parent', {
      statusCode: BAD_REQUEST
    })
  }

  const assets = await find({
    parent: { _eq: parent.id }
  })

  if (!assets || !assets.length) {
    throw new Boom.Boom('error getting assets', {
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
      update_asset(where: {key: {_in: $keys}}, _set: {status: "detached"}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutation, { keys: assets.map(asset => asset.key) })

  return {
    trxid: transaction.transaction_id
  }
}

const createOffer = async (user, payload) => {
  const organization = await organizationService.findOne({
    id: { _eq: payload.organization }
  })

  if (!organization) {
    throw new Boom.Boom('error organization not found', {
      statusCode: BAD_REQUEST
    })
  }

  const asset = await findOne({
    id: { _eq: payload.asset }
  })

  if (!asset) {
    throw new Boom.Boom('error asset not found', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.offer(user.orgAccount, password, {
    owner: user.orgAccount,
    newowner: organization.account,
    assetids: [asset.key],
    memo: payload.memo || ''
  })

  if (!transaction) {
    throw new Boom.Boom('error creating offer', {
      statusCode: BAD_REQUEST
    })
  }

  const mutation = `
    mutation ($key: String!, $newowner: String!) {
      update_asset(where: {key: {_eq: $key}}, _set: {status: "offer_created", offered_to: $newowner}) {
        affected_rows
      }
    }
  `
  await hasuraUtil.request(mutation, {
    key: asset.key,
    newowner: organization.account
  })

  return {
    trxid: transaction.transaction_id
  }
}

const claimOffer = async (user, payload) => {
  const assets = await find({
    id: { _in: payload.assets },
    offered_to: { _eq: user.orgAccount }
  })
  const keys = assets.map(asset => asset.key)

  if (!keys.length) {
    throw new Boom.Boom('error assets not found', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.claim(user.orgAccount, password, {
    claimer: user.orgAccount,
    assetids: keys
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
    keys
  })

  return {
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

  if (!assets.length) {
    throw new Boom.Boom('error assets not found', {
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
    throw new Boom.Boom('error updating asset', {
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

  for (
    let index = 0;
    index < transaction.processed.action_traces.length;
    index++
  ) {
    const actionData = transaction.processed.action_traces[index].act.data

    await hasuraUtil.request(mutation, {
      key: actionData.assetid,
      data: JSON.parse(actionData.mdata)
    })
  }

  return {
    trxid: transaction.transaction_id
  }
}

// TODO: check if the product belongs to the manufacturer
// TODO: use enum for status
const createOrder = async (user, payload) => {
  // check if the manufacturer is in the database
  const manufacturer = await manufacturerService.findOne({
    id: { _eq: payload.manufacturer }
  })

  if (!manufacturer) {
    throw new Boom.Boom('error getting manufacturer', {
      statusCode: BAD_REQUEST
    })
  }

  // check if the product is in the database
  const product = await productService.findOne({
    id: { _eq: payload.product }
  })

  if (!product) {
    throw new Boom.Boom('error getting product', {
      statusCode: BAD_REQUEST
    })
  }

  const { assets, transaction } = await createAssets(user, 'order', {
    idata: {
      manufacturer: {
        id: manufacturer.id,
        name: manufacturer.name
      },
      product: {
        id: product.id,
        name: product.name,
        quantity: payload.vaccines,
        doses: payload.type
      }
    }
  })

  return {
    id: assets[0].id,
    key: assets[0].key,
    trxid: transaction.transaction_id
  }
}

const createBatch = async (user, payload) => {
  // check if the order exist in the database and status its created
  const order = await findOne({
    id: { _eq: payload.order }
  })

  if (!order || order.status !== 'created') {
    throw new Boom.Boom('error getting order', {
      statusCode: BAD_REQUEST
    })
  }

  const password = await vaultService.getSecret(user.orgAccount)

  const { assets, transaction } = await createAssets(user, 'batch', {
    parent: order.id,
    idata: {
      order: order.key,
      lot: payload.lot,
      exp: payload.exp
    }
  })
  const batch = assets[0]

  const { assets: boxes } = await createAssets(
    user,
    'box',
    {
      parent: batch.id,
      idata: { batch: batch.id }
    },
    payload.boxes
  )

  for (let b = 0; b < boxes.length; b++) {
    const box = boxes[b]
    const { assets: wrappers } = await createAssets(
      user,
      'wrapper',
      {
        parent: box.id,
        idata: { box: box.key }
      },
      payload.wrappers
    )

    for (let w = 0; w < wrappers.length; w++) {
      const wrapper = wrappers[w]
      const { assets: containers } = await createAssets(
        user,
        'container',
        {
          parent: wrapper.id,
          idata: { wrapper: wrapper.key }
        },
        payload.containers
      )

      for (let c = 0; c < containers.length; c++) {
        const container = containers[c]
        const { assets: vaccines } = await createAssets(
          user,
          'vaccine',
          {
            parent: container.id,
            idata: { container: container.key }
          },
          payload.vaccines
        )

        await attachAssets(user, password, {
          assetidc: container.key,
          assetids: vaccines.map(vaccine => vaccine.key)
        })
      }

      await attachAssets(user, password, {
        assetidc: wrapper.key,
        assetids: containers.map(container => container.key)
      })
    }

    await attachAssets(user, password, {
      assetidc: box.key,
      assetids: wrappers.map(wrapper => wrapper.key)
    })
  }

  await attachAssets(user, password, {
    assetidc: batch.key,
    assetids: boxes.map(box => box.key)
  })

  await attachAssets(user, password, {
    assetidc: order.key,
    assetids: [batch.key]
  })

  return {
    id: batch.id,
    key: batch.key,
    trxid: transaction.transaction_id
  }
}

const getOffertsFor = async account => {
  const { rows } = await eosUtil.getTableRows({
    scope: 'simpleassets',
    code: 'simpleassets',
    table: 'offers',
    index_position: 3,
    key_type: 'name',
    lower_bound: account,
    upper_bound: account
  })

  return rows
}

module.exports = {
  createOrder,
  createBatch,
  detachAssets,
  createOffer,
  claimOffer,
  updateAssets,
  getOffertsFor
}
