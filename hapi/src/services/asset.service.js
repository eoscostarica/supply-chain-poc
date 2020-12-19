const Boom = require('@hapi/boom')
const { BAD_REQUEST } = require('http-status-codes')

const manufacturerService = require('./manufacturer.service')
const productService = require('./product.service')
const vaultService = require('./vault.service')
const { simpleassetsUtil, eosUtil, hasuraUtil } = require('../utils')

const createAsset = async (user, category, idata = {}, mdata = {}) => {
  // check if the password is in the vault
  const password = await vaultService.getSecret(user.account)

  if (!password) {
    throw new Boom.Boom('error getting account password', {
      statusCode: BAD_REQUEST
    })
  }

  const transaction = await simpleassetsUtil.create(user.account, password, {
    category,
    idata: JSON.stringify(idata),
    author: user.account,
    owner: user.account,
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
      key: createlogData.assetid,
      author: createlogData.author,
      owner: createlogData.owner,
      category: createlogData.category,
      idata: JSON.parse(createlogData.idata),
      mdata: JSON.parse(createlogData.mdata),
      history: [
        {
          user: {
            id: user.sub,
            account: user.account
          },
          action: 'create',
          processed_at: transaction.processed.block_time,
          transaction_id: transaction.transaction_id
        }
      ],
      status: JSON.parse(createlogData.mdata).status
    }
  })

  return {
    asset,
    transaction
  }
}

// TODO: check if the product belongs to the manufacturer
const createOffer = async (user, { type, ...payload }) => {
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
      ...product
    }
  })

  return {
    id: asset.id,
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

// TODO: use enum for status
const createBatch = async (user, payload) => {
  // check if the order exist in the database and is not delivered
  const order = await findOne({
    id: { _eq: payload.order }
  })

  if (!order || order.status === 'delivered') {
    throw new Boom.Boom('error getting order', {
      statusCode: BAD_REQUEST
    })
  }

  const { asset, transaction } = await createAsset(user, 'batch', {
    ...payload,
    order: order.key
  })

  const vaccine = await createVaccine(user, {
    batch: asset.id
  })
  console.log('vaccine', vaccine)
  const password = await vaultService.getSecret(user.account)
  const atach = await simpleassetsUtil.attach(user.account, password, {
    owner: user.account,
    assetidc: asset.key,
    assetids: [vaccine.key]
  })
  console.log(atach)

  return {
    id: asset.id,
    trxid: transaction.transaction_id
  }
}

const createVaccine = async (user, payload) => {
  // check if the order exist in the database and is not delivered
  const batch = await findOne({
    id: { _eq: payload.batch }
  })

  if (!batch || batch.status === 'delivered') {
    throw new Boom.Boom('error getting batch', {
      statusCode: BAD_REQUEST
    })
  }

  const { asset } = await createAsset(user, 'vaccine', {
    ...payload,
    batch: batch.key
  })

  return asset
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
  createOffer,
  createBatch,
  getOffertsFor
}
