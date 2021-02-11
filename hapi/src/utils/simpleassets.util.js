const { simpleassetsConfig } = require('../config')

const eosUtil = require('./eos.util')

const create = async (account, password, data) => {
  try {
    const transaction = await eosUtil.transact(
      [
        {
          authorization: [
            {
              actor: account,
              permission: 'active'
            }
          ],
          account: simpleassetsConfig.account,
          name: 'create',
          data
        }
      ],
      account,
      password
    )

    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

const createSet = async (account, password, actions) => {
  try {
    const start = new Date()
    const transaction = await eosUtil.transact(
      actions.map(action => ({
        authorization: [
          {
            actor: account,
            permission: 'active'
          }
        ],
        account: simpleassetsConfig.account,
        name: 'create',
        data: { ...action }
      })),
      account,
      password
    )
    const end = new Date()
    console.log(
      `simpleassets.util ${end.getTime() - start.getTime()}ms to get trxid ${
        transaction.transaction_id
      }`
    )
    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

const attach = async (account, password, data) => {
  try {
    const transaction = await eosUtil.transact(
      [
        {
          authorization: [
            {
              actor: account,
              permission: 'active'
            }
          ],
          account: simpleassetsConfig.account,
          name: 'attach',
          data
        }
      ],
      account,
      password
    )

    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

const detach = async (account, password, data) => {
  try {
    const transaction = await eosUtil.transact(
      [
        {
          authorization: [
            {
              actor: account,
              permission: 'active'
            }
          ],
          account: simpleassetsConfig.account,
          name: 'detach',
          data
        }
      ],
      account,
      password
    )

    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

const offer = async (account, password, data) => {
  try {
    const transaction = await eosUtil.transact(
      [
        {
          authorization: [
            {
              actor: account,
              permission: 'active'
            }
          ],
          account: simpleassetsConfig.account,
          name: 'offer',
          data
        }
      ],
      account,
      password
    )

    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

const claim = async (account, password, data) => {
  try {
    const transaction = await eosUtil.transact(
      [
        {
          authorization: [
            {
              actor: account,
              permission: 'active'
            }
          ],
          account: simpleassetsConfig.account,
          name: 'claim',
          data
        }
      ],
      account,
      password
    )

    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

const update = async (account, password, actions) => {
  try {
    const transaction = await eosUtil.transact(
      actions.map(action => ({
        authorization: [
          {
            actor: account,
            permission: 'active'
          }
        ],
        account: simpleassetsConfig.account,
        name: 'update',
        data: { ...action }
      })),
      account,
      password
    )

    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

const burn = async (account, password, data) => {
  try {
    const transaction = await eosUtil.transact(
      [
        {
          authorization: [
            {
              actor: account,
              permission: 'active'
            }
          ],
          account: simpleassetsConfig.account,
          name: 'burn',
          data
        }
      ],
      account,
      password
    )

    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

const createntt = async (account, password, actions) => {
  try {
    const transaction = await eosUtil.transact(
      actions.map(action => ({
        authorization: [
          {
            actor: account,
            permission: 'active'
          }
        ],
        account: simpleassetsConfig.account,
        name: 'createntt',
        data: { ...action }
      })),
      account,
      password
    )

    return transaction
  } catch (error) {
    console.log('error', error)
  }
}

module.exports = {
  attach,
  detach,
  create,
  createSet,
  offer,
  claim,
  update,
  burn,
  createntt
}
