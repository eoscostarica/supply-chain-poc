const { hasuraUtil } = require('../utils')

const findOne = async (where = {}) => {
  const query = `
    query ($where: manufacturer_bool_exp!) {
      manufacturer(where: $where, limit: 1) {
        id
        name
        data
      }
    }
  `
  const { manufacturer: data } = await hasuraUtil.request(query, { where })

  if (data && data.length > 0) {
    return data[0]
  }

  return null
}

module.exports = {
  findOne
}
