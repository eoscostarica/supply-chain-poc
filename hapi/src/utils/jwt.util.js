const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')

const { jwtConfig } = require('../config')

const sign = ({ id: sub, role, ...payload }) => {
  const accessToken = jwt.sign(
    {
      sub,
      role,
      iss: jwtConfig.iss,
      'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': [role],
        'x-hasura-default-role': role,
        'X-Hasura-User-Id': sub
      },
      jti: uuid(),
      ...payload
    },
    jwtConfig.secret,
    {
      algorithm: jwtConfig.algorithm,
      expiresIn: new Date().getTime() + 3600000
    }
  )

  return {
    access_token: accessToken,
    refresh_token: Buffer.from(uuid()).toString('base64')
  }
}

const registerAuthStrategy = async server => {
  await server.register(require('hapi-auth-jwt2'))

  server.auth.strategy('jwt', 'jwt', {
    key: jwtConfig.secret,
    validate: async () => ({
      isValid: true
    }),
    verifyOptions: {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.iss
    }
  })

  server.auth.default('jwt')
}

module.exports = {
  sign,
  registerAuthStrategy
}
