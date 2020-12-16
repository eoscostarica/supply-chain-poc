const crypto = require('crypto')
const Boom = require('@hapi/boom')
const { BAD_REQUEST } = require('http-status-codes')

const { hasuraUtil, jwtUtil } = require('../utils')

const getUser = async (where = {}) => {
  const query = `
    query ($where: user_bool_exp) {
      user(where: $where, limit: 1) {
        id
        name
        account
        username
        email
        role
      }
    }
  `
  const { user: data } = await hasuraUtil.request(query, { where })

  if (data && data.length > 0) return data[0]

  return null
}

const getRefreshToken = async (where = {}) => {
  const query = `
    query ($where: refresh_token_bool_exp) {
      refresh_token(where: $where, limit: 1) {
        id
        token
        expired_at
        user: userByUser {
          id
          name
          account
          username
          email
          role
        }
      }
    }
  `
  const { refresh_token: data } = await hasuraUtil.request(query, { where })

  if (data && data.length > 0) return data[0]

  return null
}

const saveRefreshToken = async (payload) => {
  const mutation = `
    mutation ($payload: refresh_token_insert_input!) {
      insert_refresh_token_one(object: $payload) {
        id
      }
    }  
  `
  const { refresh_token: data } = await hasuraUtil.request(mutation, {
    payload
  })

  return data
}

const deleteRefreshToken = async (id) => {
  const mutation = `mutation ($id: uuid!) {
    delete_refresh_token_by_pk(id: $id) {
      id
    }
  }`
  await hasuraUtil.request(mutation, { id })
}

const login = async ({ username, password }) => {
  const passwordHash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex')

  const user = await getUser({
    _or: [{ username: { _eq: username } }, { email: { _eq: username } }],
    password: { _eq: passwordHash }
  })

  if (!user) {
    throw new Boom.Boom('username or password invalid', {
      statusCode: BAD_REQUEST
    })
  }

  const response = jwtUtil.sign(user)

  await saveRefreshToken({
    user: user.id,
    token: response.refresh_token,
    expired_at: new Date(new Date().getTime() + 7200000)
  })

  return response
}

const refreshToken = async ({ token }) => {
  const data = await getRefreshToken({ token: { _eq: token } })

  if (!data) {
    throw new Boom.Boom('invalid token or expired', {
      statusCode: BAD_REQUEST
    })
  }

  await deleteRefreshToken(data.id)

  if (new Date(data.expired_at).getTime() - new Date().getTime() < 0) {
    throw new Boom.Boom('invalid token or expired', {
      statusCode: BAD_REQUEST
    })
  }

  const response = jwtUtil.sign(data.user)

  await saveRefreshToken({
    user: data.user.id,
    token: response.refresh_token,
    expired_at: new Date(new Date().getTime() + 7200000)
  })

  return response
}

module.exports = {
  login,
  refreshToken
}
