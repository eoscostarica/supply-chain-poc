const assetHistoryRoute = require('./asset-history')
const burnAssetsRoute = require('./burn-assets.route')
const claimOfferRoute = require('./claim-offer.route')
const creatBatchRoute = require('./create-batch.route')
const creatGS1AssetsRoute = require('./create-gs1-assets.route')
const createOfferRoute = require('./create-offer.route')
const createOrderRoute = require('./create-order.route')
const detachAssetsRoute = require('./detach-assets.route')
const healthzRoute = require('./healthz.route')
const loginRoute = require('./login.route')
const refreshTokenRoute = require('./refresh-token.route')
const updateAssetsRoute = require('./update-assets')
const vaccinationRoute = require('./vaccination.route')

module.exports = [
  assetHistoryRoute,
  burnAssetsRoute,
  claimOfferRoute,
  creatBatchRoute,
  creatGS1AssetsRoute,
  createOfferRoute,
  createOrderRoute,
  detachAssetsRoute,
  healthzRoute,
  loginRoute,
  refreshTokenRoute,
  updateAssetsRoute,
  vaccinationRoute
]
