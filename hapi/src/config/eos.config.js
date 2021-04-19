module.exports = {
  endpoint: process.env.HAPI_EOS_API_ENDPOINT,
  chainId: process.env.HAPI_EOS_API_CHAIN_ID,
  baseAccount: process.env.HAPI_EOS_BASE_ACCOUNT,
  baseAccountPassword: process.env.HAPI_EOS_BASE_ACCOUNT_PASSWORD,
  authorityForNewAccounts: process.env.HAPI_EOS_AUTHORITY_FOR_NEW_ACCOUNTS,
  walletUrl: process.env.HAPI_EOS_WALLET_URL,
  proxyAction: process.env.HAPI_EOS_PROXY_ACTION
    ? JSON.parse(process.env.HAPI_EOS_PROXY_ACTION)
    : null
}
