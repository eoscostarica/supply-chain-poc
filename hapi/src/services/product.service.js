const { hasuraUtil } = require('../utils')

const findOne = async (where = {}) => {
  const query = `
  query ($where: product_bool_exp!) {
    product(where: $where, limit: 1) {
      id
      name
    }
  }
  `
  const { product: data } = await hasuraUtil.request(query, { where })

  if (data && data.length > 0) {
    return data[0]
  }

  return null
}

module.exports = {
  findOne
}
