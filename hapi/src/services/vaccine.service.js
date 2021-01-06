// TODO: use enum for categories

const Boom = require('@hapi/boom')
const { BAD_REQUEST } = require('http-status-codes')

const assetService = require('./asset.service')
const manufacturerService = require('./manufacturer.service')
const productService = require('./product.service')
const organizationService = require('./organization.service')
const { hasuraUtil } = require('../utils')

// TODO: check if the product belongs to the manufacturer
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

  const { assets, trxid } = await assetService.createAssets(user, {
    category: 'order',
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
    trxid
  }
}

const createBatch = async (user, payload) => {
  // check if the order exist in the database and status its created
  const order = await assetService.findOne({
    id: { _eq: payload.order }
  })

  if (!order || order.status !== 'created') {
    throw new Boom.Boom('error getting order', {
      statusCode: BAD_REQUEST
    })
  }

  const { assets, trxid } = await assetService.createAssets(user, {
    parent: order.id,
    category: 'batch',
    idata: {
      order: order.key,
      lot: payload.lot,
      exp: payload.exp
    }
  })
  const batch = assets[0]

  const { assets: boxes } = await assetService.createAssets(
    user,
    {
      parent: batch.id,
      category: 'box',
      idata: { batch: batch.id }
    },
    payload.boxes
  )

  for (let b = 0; b < boxes.length; b++) {
    const box = boxes[b]
    const { assets: wrappers } = await assetService.createAssets(
      user,
      {
        parent: box.id,
        category: 'wrapper',
        idata: { box: box.key }
      },
      payload.wrappers
    )

    for (let w = 0; w < wrappers.length; w++) {
      const wrapper = wrappers[w]
      const { assets: containers } = await assetService.createAssets(
        user,
        {
          category: 'container',
          parent: wrapper.id,
          idata: { wrapper: wrapper.key }
        },
        payload.containers
      )

      for (let c = 0; c < containers.length; c++) {
        const container = containers[c]
        const { assets: vaccines } = await assetService.createAssets(
          user,
          {
            parent: container.id,
            category: 'vaccine',
            idata: { container: container.key }
          },
          payload.vaccines
        )

        await assetService.attachAssets(user, {
          parent: container.id,
          assets: vaccines.map(vaccine => vaccine.id)
        })
      }

      await assetService.attachAssets(user, {
        parent: wrapper.id,
        assets: containers.map(container => container.id)
      })
    }

    await assetService.attachAssets(user, {
      parent: box.id,
      assets: wrappers.map(wrapper => wrapper.id)
    })
  }

  await assetService.attachAssets(user, {
    parent: batch.id,
    assets: boxes.map(box => box.id)
  })

  await assetService.attachAssets(user, {
    parent: order.id,
    assets: [batch.id]
  })

  return {
    id: batch.id,
    key: batch.key,
    trxid
  }
}

const createVaccinationRecord = async object => {
  const mutation = `
    mutation ($object: vaccination_insert_input!) {
      vaccination: insert_vaccination_one(object: $object) {
        id
      }
    }
  `
  const { vaccination } = await hasuraUtil.request(mutation, {
    object
  })

  return vaccination
}

const vaccination = async (user, payload) => {
  const organization = await organizationService.findOne({
    id: { _eq: payload.organization }
  })

  if (!organization) {
    throw new Boom.Boom('error organization not found', {
      statusCode: BAD_REQUEST
    })
  }

  // const vaccination = await createVaccinationRecord({
  //   vaccine_id: payload.vaccine,
  //   vaccinator_id: user.id,
  //   health_center_id: organization.id,
  //   vaccinated_ref: payload.person_ref
  // })

  // const transaction = await assetService.burn(user, {
  //   assets: [payload.vaccine],
  //   description: `vaccination id ${vaccination.id}`
  // })

  const transaction = await assetService.createNonTransferableToken(user, {
    category: 'vaccinecer',
    idata: {
      ref: 'd5d24206-1af4-40d7-b769-ed4f6b8bcb5a',
      vaccine: '100000000000176'
    },
    owner: 'reviewer1111'
  })

  return {
    id: vaccination.id,
    trxid: transaction.trxid
  }
}

module.exports = {
  createBatch,
  createOrder,
  vaccination
}
