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
    },
    status: 'creating'
  })
  const batch = assets[0]

  const createNestedAssets = async () => {
    const { assets: boxes } = await assetService.createAssets(
      user,
      {
        parent: batch.id,
        category: 'box',
        idata: { batch: batch.id },
        status: 'creating'
      },
      payload.boxes
    )

    await Promise.all(
      boxes.map(async box => {
        const { assets: wrappers } = await assetService.createAssets(
          user,
          {
            parent: box.id,
            category: 'wrapper',
            idata: { box: box.key },
            status: 'creating'
          },
          payload.wrappers
        )
        await Promise.all(
          wrappers.map(async wrapper => {
            const { assets: containers } = await assetService.createAssets(
              user,
              {
                category: 'container',
                parent: wrapper.id,
                idata: { wrapper: wrapper.key },
                status: 'creating'
              },
              payload.containers
            )
            await Promise.all(
              containers.map(async container => {
                const { assets: vaccines } = await assetService.createAssets(
                  user,
                  {
                    parent: container.id,
                    category: 'vaccine',
                    idata: { container: container.key },
                    status: 'creating'
                  },
                  payload.vaccines
                )
                await assetService.attachAssets(user, {
                  parent: container.id,
                  assets: vaccines.map(vaccine => vaccine.id)
                })
              })
            )
            await assetService.attachAssets(user, {
              parent: wrapper.id,
              assets: containers.map(container => container.id)
            })
          })
        )
        await assetService.attachAssets(user, {
          parent: box.id,
          assets: wrappers.map(wrapper => wrapper.id)
        })
      })
    )

    await assetService.attachAssets(user, {
      parent: batch.id,
      assets: boxes.map(box => box.id)
    })

    await assetService.attachAssets(user, {
      parent: order.id,
      assets: [batch.id]
    })
  }

  createNestedAssets()

  return {
    id: batch.id,
    key: batch.key,
    trxid
  }
}

const createGS1Assets = async (user, payload) => {
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
    category: 'pallet',
    idata: {
      manufacturer: {
        id: manufacturer.id,
        name: manufacturer.name,
        gln: manufacturer?.data?.gln || ''
      },
      product: {
        id: product.id,
        name: product.name,
        doses: payload.doses,
        quantity: payload.vaccines
      },
      order: payload.order,
      batch: payload.batch,
      exp: payload.exp
    }
  })
  const pallet = assets[0]

  const createNestedAssets = async () => {
    const { assets: cases } = await assetService.createAssets(
      user,
      {
        parent: pallet.id,
        category: 'case',
        idata: { pallet: pallet.key },
        status: 'creating'
      },
      payload.cases
    )

    for (let index = 0; index < cases.length; index++) {
      const caseAsset = cases[index]
      const { assets: vaccines } = await assetService.createAssets(
        user,
        {
          parent: caseAsset.id,
          category: 'vaccine',
          idata: { case: caseAsset.key },
          status: 'creating'
        },
        payload.vaccines
      )
      await assetService.attachAssets(user, {
        parent: caseAsset.id,
        assets: vaccines.map(item => item.id)
      })
    }

    await assetService.attachAssets(user, {
      parent: pallet.id,
      assets: cases.map(item => item.id)
    })
  }

  createNestedAssets()

  return {
    id: pallet.id,
    key: pallet.key,
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

const getValidVaccine = async (owner, batch) => {
  const query = `
    query($idata: jsonb, $owner: String!) {
      pallets: asset(
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
        key
        cases: assets {
          vaccines: assets(
            where: {
              status: { _in: ["unwrapped", "offer_claimed"] }
              owner: { _eq: $owner }
            }
          ) {
            id
            key
          }
        }
      }
    }
  `
  const { pallets } = await hasuraUtil.request(query, {
    owner,
    idata: { batch }
  })
  const vaccines = []

  for (let index = 0; index < pallets.length; index++) {
    const pallet = pallets[index]
    for (let c = 0; c < pallet.cases.length; c++) {
      const caseAsset = pallet.cases[c]
      for (let v = 0; v < caseAsset.vaccines.length; v++) {
        const vaccine = caseAsset.vaccines[v]
        vaccines.push(vaccine)
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

  const pallet = await assetService.findOne({
    idata: { _contains: { batch: payload.batch } }
  })
  const transaction = await assetService.createNonTransferableToken(user, {
    category: 'vaccine.cer',
    idata: {
      name: 'COVID-19 Vaccination Certificate',
      vaccine_id: vaccine.key,
      internal_id: vaccination.id,
      lot: pallet.idata.batch,
      exp: pallet.idata.exp,
      manufacturer: {
        internal_id: pallet.idata.manufacturer.id,
        name: pallet.idata.manufacturer.name
      },
      product: {
        internal_id: pallet.idata.product.id,
        name: pallet.idata.product.name,
        doses: pallet.idata.product.doses
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
  vaccination,
  createGS1Assets
}
