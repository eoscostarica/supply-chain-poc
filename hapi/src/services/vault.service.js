const { hasuraUtil } = require('../utils')

const getSecret = async key => {
  const query = `
    query ($key: String!) {
      vault (where: { account: {_eq: $key}}) {
        password
      }
    }
  `
  const { vault: data } = await hasuraUtil.request(query, { key })

  if (data && data.length > 0) return data[0].password

  return null
}

module.exports = {
  getSecret
}
