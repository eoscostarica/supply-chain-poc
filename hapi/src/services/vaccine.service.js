// TODO: use enum for categories

const Boom = require('@hapi/boom')
const { BAD_REQUEST } = require('http-status-codes')

const assetService = require('./asset.service')
const manufacturerService = require('./manufacturer.service')
const productService = require('./product.service')
const organizationService = require('./organization.service')
const personService = require('./person.service')
const vaultService = require('./vault.service')
const historyService = require('./history.service')
const { hasuraUtil, eosUtil } = require('../utils')
const { simpleassetsConfig } = require('../config')

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

const getValidVaccine = async (owner, lot) => {
  const query = `
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
        key
        boxes: assets {
          wrappers: assets {
            containers: assets {
              vaccines: assets (where: { status: { _eq: "unwrapped" } owner: { _eq: $owner } }) {
                id
                key
              }
            }
          }
        }
      }
    }
  `
  const { batch: batches } = await hasuraUtil.request(query, {
    owner,
    idata: { lot }
  })
  const vaccines = []

  for (let index = 0; index < batches.length; index++) {
    const batch = batches[index]

    for (let b = 0; b < batch.boxes.length; b++) {
      const box = batch.boxes[b]

      for (let w = 0; w < box.wrappers.length; w++) {
        const wrapper = box.wrappers[w]

        for (let c = 0; c < wrapper.containers.length; c++) {
          const container = wrapper.containers[c]

          for (let v = 0; v < container.vaccines.length; v++) {
            const vaccine = container.vaccines[c]
            vaccines.push(vaccine)
          }
        }
      }
    }
  }

  return vaccines.length > 0 ? vaccines[0] : null
}

const getPerson = async dni => {
  const person = await personService.findOne({
    dni: { _eq: dni }
  })

  if (person && !person.account) {
    const account = await eosUtil.generateRandomAccountName('poc')
    const { password } = await eosUtil.newAccount(account)
    await vaultService.save({
      account,
      password
    })
    await personService.setAccount(person.id, account)

    return {
      ...person,
      account
    }
  }

  return person
}

const vaccination = async (user, payload) => {
  const vaccine = await getValidVaccine(user.orgAccount, payload.batch)

  if (!vaccine) {
    throw new Boom.Boom('none valid vaccine found', {
      statusCode: BAD_REQUEST
    })
  }

  const organization = await organizationService.findOne({
    id: { _eq: payload.organization }
  })

  if (!organization) {
    throw new Boom.Boom('organization not found', {
      statusCode: BAD_REQUEST
    })
  }

  const person = await getPerson(payload.person)

  if (!person) {
    throw new Boom.Boom('person not found', {
      statusCode: BAD_REQUEST
    })
  }

  const vaccination = await createVaccinationRecord({
    vaccine_id: vaccine.id,
    vaccinator_id: user.id,
    health_center_id: organization.id,
    vaccinated_id: person.id
  })

  await assetService.burn(user, {
    assets: [vaccine.id],
    description: `vaccination id ${vaccination.id}`
  })

  const batch = await assetService.findOne({
    idata: { _contains: { lot: payload.batch } }
  })
  const order = await assetService.findOne({
    key: { _eq: batch.idata.order }
  })
  const transaction = await assetService.createNonTransferableToken(user, {
    category: 'vaccine.cer',
    idata: {
      name: 'COVID-19 Vaccination Certificate',
      vaccine_id: vaccine.key,
      internal_id: vaccination.id,
      lot: batch.idata.lot,
      exp: batch.idata.exp,
      manufacturer: {
        internal_id: order.idata.manufacturer.id,
        name: order.idata.manufacturer.name
      },
      product: {
        internal_id: order.idata.manufacturer.id,
        name: order.idata.manufacturer.name,
        doses: order.idata.manufacturer.doses
      }
    },
    mdata: {
      img: simpleassetsConfig.nttImage,
      status: 'active'
    },
    owner: person.account
  })
  await historyService.createHistory([
    {
      action: 'vaccination',
      data: {
        user: {
          name: user.name,
          account: user.account,
          orgAccount: user.orgAccount,
          orgName: user.orgName
        },
        person: {
          account: person.account,
          name: person.name
        },
        ntt: transaction.assets[0].key
      },
      asset_id: vaccine.id,
      trxid: transaction.trxid
    }
  ])

  return {
    id: vaccination.id,
    key: transaction.assets[0].key,
    trxid: transaction.trxid,
    account: person.account
  }
}

module.exports = {
  createBatch,
  createOrder,
  vaccination
}
