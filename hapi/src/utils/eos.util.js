const { Api, JsonRpc } = require('eosjs')
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig')
const fetch = require('node-fetch')
const { TextEncoder, TextDecoder } = require('util')
const EosApi = require('eosjs-api')

const { eosConfig } = require('../config')

const walletUtil = require('./wallet.util')

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
const rpc = new JsonRpc(eosConfig.endpoint, { fetch })
const eosApi = EosApi({
  httpEndpoint: eosConfig.endpoint,
  verbose: false,
  fetchConfiguration: {}
})

const newAccount = async accountName => {
  const password = await walletUtil.create(accountName)
  const key = await walletUtil.createKey(accountName)

  try {
    await walletUtil.unlock(
      eosConfig.baseAccount,
      eosConfig.baseAccountPassword
    )
  } catch (error) {}

  const keys = await walletUtil.listKeys(
    eosConfig.baseAccount,
    eosConfig.baseAccountPassword
  )
  const api = new Api({
    rpc,
    textDecoder,
    textEncoder,
    chainId: eosConfig.chainId,
    signatureProvider: new JsSignatureProvider(keys)
  })
  const authorization = [
    {
      actor: eosConfig.baseAccount,
      permission: 'active'
    }
  ]

  const transaction = await api.transact(
    {
      actions: [
        {
          authorization,
          account: 'eosio',
          name: 'newaccount',
          data: {
            creator: eosConfig.baseAccount,
            name: accountName,
            owner: JSON.parse(
              eosConfig.authorityForNewAccounts.replace('pub_key', key)
            ),
            active: JSON.parse(
              eosConfig.authorityForNewAccounts.replace('pub_key', key)
            )
          }
        }
      ]
    },
    {
      blocksBehind: 3,
      expireSeconds: 30
    }
  )
  await walletUtil.lock(eosConfig.baseAccount)

  return {
    password,
    transaction
  }
}

const generateRandomAccountName = async (prefix = '') => {
  const length = 12

  if (prefix.length === 12) return prefix

  const characters = 'abcdefghijklmnopqrstuvwxyz12345'
  let accountName = prefix

  while (accountName.length < length) {
    accountName = `${accountName}${characters.charAt(
      Math.floor(Math.random() * characters.length)
    )}`
  }

  try {
    const account = await getAccount(accountName)

    return account ? generateRandomAccountName(prefix) : accountName
  } catch (error) {
    return accountName
  }
}

const getAbi = account => eosApi.getAbi(account)

const getAccount = async account => {
  try {
    const accountInfo = await eosApi.getAccount(account)

    return accountInfo
  } catch (error) {
    return null
  }
}

const getBlock = async blockNumber => {
  try {
    const block = await eosApi.getBlock(blockNumber)

    return block
  } catch (error) {
    return null
  }
}

const getCodeHash = account => eosApi.getCodeHash(account)

const getCurrencyBalance = (code, account, symbol) =>
  eosApi.getCurrencyBalance(code, account, symbol)

const getTableRows = options => eosApi.getTableRows({ json: true, ...options })

const transact = async (actions, account, password) => {
  try {
    await walletUtil.unlock(account, password)
  } catch (error) {}

  const keys = await walletUtil.listKeys(account, password)
  const api = new Api({
    rpc,
    textDecoder,
    textEncoder,
    chainId: eosConfig.chainId,
    signatureProvider: new JsSignatureProvider(keys)
  })
  const proxyActions = []

  if (eosConfig.proxyAction) {
    proxyActions.push(eosConfig.proxyAction)
  }

  const transaction = await api.transact(
    {
      actions: [...proxyActions, ...actions]
    },
    {
      blocksBehind: 3,
      expireSeconds: 30
    }
  )

  await walletUtil.lock(account)

  return transaction
}

module.exports = {
  newAccount,
  generateRandomAccountName,
  getAccount,
  getBlock,
  getAbi,
  getCodeHash,
  getCurrencyBalance,
  getTableRows,
  transact
}
