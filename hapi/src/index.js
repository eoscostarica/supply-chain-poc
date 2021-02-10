const Hapi = require('@hapi/hapi')

const { serverConfig } = require('./config')
const { assetService } = require('./services')
const routes = require('./routes')
const { jwtUtil, rabbitmqUtil } = require('./utils')

const init = async () => {
  const server = Hapi.server({
    port: serverConfig.port,
    host: serverConfig.host,
    routes: {
      cors: { origin: ['*'] }
    },
    debug: { request: ['handler'] }
  })

  server.route(routes)
  await jwtUtil.registerAuthStrategy(server)
  await rabbitmqUtil.init()
  await rabbitmqUtil.consume(assetService.processAssetsFromQueue)
  await server.start()
  console.log(`🚀 Server ready at ${server.info.uri}`)
  server.table().forEach(route => console.log(`${route.method}\t${route.path}`))
}

process.on('uncaughtException', (err, origin) => {
  console.log('Uncaught Exception:', err, 'Exception origin:', origin)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection:', promise, 'reason:', reason)
})

init()
