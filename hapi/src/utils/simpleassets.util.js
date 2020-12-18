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

module.exports = {
  attach,
  create
}
