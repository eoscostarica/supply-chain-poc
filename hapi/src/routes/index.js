const claimOfferRoute = require('./claim-offer.route')
const creatBatchRoute = require('./create-batch.route')
const createOfferRoute = require('./create-offer.route')
const createOrderRoute = require('./create-order.route')
const detachAssetsRoute = require('./detach-assets.route')
const healthzRoute = require('./healthz.route')
const loginRoute = require('./login.route')
const refreshTokenRoute = require('./refresh-token.route')
const updateAssetsRoute = require('./update-assets')
const vaccinationRoute = require('./vaccination.route')

module.exports = [
  claimOfferRoute,
  creatBatchRoute,
  createOfferRoute,
  createOrderRoute,
  detachAssetsRoute,
  healthzRoute,
  loginRoute,
  refreshTokenRoute,
  updateAssetsRoute,
  vaccinationRoute
]
