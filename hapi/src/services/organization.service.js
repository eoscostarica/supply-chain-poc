const { hasuraUtil } = require('../utils')

const findOne = async (where = {}) => {
  const query = `
    query ($where: organization_bool_exp!) {
      organization(where: $where, limit: 1) {
        id
        name
        account
      }
    }  
  `
  const { organization: data } = await hasuraUtil.request(query, { where })

  if (data && data.length > 0) {
    return data[0]
  }

  return null
}

module.exports = {
  findOne
}
