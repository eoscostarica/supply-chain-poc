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

module.exports = {
  attach,
  detach,
  create,
  createSet,
  offer,
  claim
}
