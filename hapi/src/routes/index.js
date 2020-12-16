const healthzRoute = require('./healthz.route')
const loginRoute = require('./login.route')
const refreshTokenRoute = require('./refresh-token.route')

module.exports = [healthzRoute, loginRoute, refreshTokenRoute]
