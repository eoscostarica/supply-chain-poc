const Boom = require('@hapi/boom')
const { BAD_REQUEST } = require('http-status-codes')

const manufacturerService = require('./manufacturer.service')
const organizationService = require('./organization.service')
const productService = require('./product.service')
const vaultService = require('./vault.service')
const { simpleassetsUtil, eosUtil, hasuraUtil } = require('../utils')

const createAsset = async (
  user,
  category,
  { parent, ...idata } = {},
  mdata = {}
) => {
  // check if the password is in the vault
  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.create(user.orgAccount, password, {
    category,
    idata: JSON.stringify(idata),
    author: user.orgAccount,
    owner: user.orgAccount,
    mdata: JSON.stringify({ ...mdata, status: 'created' }),
    requireclaim: false
  })

  if (!transaction) {
    throw new Boom.Boom('error creating asset', {
      statusCode: BAD_REQUEST
    })
  }

  const actionTrace = transaction.processed.action_traces.find(
    item => !!item.inline_traces
  )
  const {
    act: { data: createlogData }
  } = actionTrace.inline_traces.find(action => action.act.name === 'createlog')

  const mutation = `
    mutation ($asset: asset_insert_input!) {
      asset: insert_asset_one(object: $asset) {
        id
        key
      }
    }
  `
  const { asset } = await hasuraUtil.request(mutation, {
    asset: {
      parent,
      key: createlogData.assetid,
      author: createlogData.author,
      owner: createlogData.owner,
      category: createlogData.category,
      idata: JSON.parse(createlogData.idata),
      mdata: JSON.parse(createlogData.mdata),
      status: JSON.parse(createlogData.mdata).status
    }
  })

  return {
    asset,
    transaction
  }
}

const createSetOfAssets = async (
  quantity,
  user,
  category,
  { parent, ...idata } = {},
  mdata = {}
) => {
  // check if the password is in the vault
  const password = await vaultService.getSecret(user.orgAccount)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const acctions = []

  for (let index = 0; index < quantity; index++) {
    acctions.push({
      category,
      idata: JSON.stringify(idata),
      author: user.orgAccount,
      owner: user.orgAccount,
      mdata: JSON.stringify({ ...mdata, status: 'created' }),
      requireclaim: false
    })
  }

  const transaction = await simpleassetsUtil.createSet(
    user.orgAccount,
    password,
    acctions
  )

  if (!transaction) {
    throw new Boom.Boom('error creating asset', {
      statusCode: BAD_REQUEST
    })
  }

  const actionTraces = transaction.processed.action_traces.filter(
    item => !!item.inline_traces
  )
  const assets = actionTraces.map(trace => {
    const {
      act: { data: createlogData }
    } = trace.inline_traces.find(action => action.act.name === 'createlog')

    return {
      parent,
      key: createlogData.assetid,
      author: createlogData.author,
      owner: createlogData.owner,
      category: createlogData.category,
      idata: JSON.parse(createlogData.idata),
      mdata: JSON.parse(createlogData.mdata),
      status: JSON.parse(createlogData.mdata).status
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
    assets
  })

  return {
    assets: info.assets.returning,
    transaction
  }
}

const attachAsset = async (user, password, { assetidc, assetids }) => {
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

// TODO: check if the product belongs to the manufacturer
// TODO: use enum for status
const createOrder = async (user, { type, vaccines, ...payload }) => {
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

  const { asset, transaction } = await createAsset(user, 'order', {
    ...payload,
    manufacturer,
    product: {
      type,
      vaccines,
      ...product
    }
  })

  return {
    id: asset.id,
    key: asset.key,
    trxid: transaction.transaction_id
  }
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

const find = async (where = {}) => {
  const query = `
  query ($where: asset_bool_exp){
    asset (where: $where) {
      id
      key
      status
    }
  }
  `
  const { asset: data } = await hasuraUtil.request(query, { where })

  return data
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

  const { asset: batch, transaction } = await createAsset(user, 'batch', {
    parent: order.id,
    order: order.key,
    lot: payload.lot,
    exp: payload.exp
  })

  const { assets: boxes } = await createSetOfAssets(
    payload.boxes,
    user,
    'box',
    {
      parent: batch.id,
      batch: batch.id
    }
  )

  for (let b = 0; b < boxes.length; b++) {
    const box = boxes[b]
    const { assets: wrappers } = await createSetOfAssets(
      payload.wrappers,
      user,
      'wrapper',
      {
        parent: box.id,
        box: box.key
      }
    )

    for (let w = 0; w < wrappers.length; w++) {
      const wrapper = wrappers[w]
      const { assets: containers } = await createSetOfAssets(
        payload.containers,
        user,
        'container',
        {
          parent: wrapper.id,
          wrapper: wrapper.key
        }
      )

      for (let c = 0; c < containers.length; c++) {
        const container = containers[c]
        const { assets: vaccines } = await createSetOfAssets(
          payload.vaccines,
          user,
          'vaccine',
          {
            parent: container.id,
            container: container.key
          }
        )

        await attachAsset(user, password, {
          assetidc: container.key,
          assetids: vaccines.map(vaccine => vaccine.key)
        })
      }

      await attachAsset(user, password, {
        assetidc: wrapper.key,
        assetids: containers.map(container => container.key)
      })
    }

    await attachAsset(user, password, {
      assetidc: box.key,
      assetids: wrappers.map(wrapper => wrapper.key)
    })
  }

  await attachAsset(user, password, {
    assetidc: batch.key,
    assetids: boxes.map(box => box.key)
  })

  await attachAsset(user, password, {
    assetidc: order.key,
    assetids: [batch.key]
  })

  return {
    id: batch.id,
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
  createOffer,
  detachAssets,
  getOffertsFor
}
