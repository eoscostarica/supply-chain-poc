module.exports = {
  account: process.env.HAPI_SIMPLEASSETS_ACCOUNT,
  nttImage: process.env.HAPI_SIMPLEASSETS_NTT_IMAGE,
  maxAllowedAssetsPerTransaction: parseInt(
    process.env.HAPI_SIMPLEASSETS_MAX_ALLOWED_ASSETS_PER_TRANSACTION || 10
  )
}
