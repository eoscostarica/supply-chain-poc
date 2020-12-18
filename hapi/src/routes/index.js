const creatBatchRoute = require('./create-batch.route')
const createOrderRoute = require('./create-order.route')
const healthzRoute = require('./healthz.route')
const loginRoute = require('./login.route')
const refreshTokenRoute = require('./refresh-token.route')

module.exports = [
  creatBatchRoute,
  createOrderRoute,
  healthzRoute,
  loginRoute,
  refreshTokenRoute
]
