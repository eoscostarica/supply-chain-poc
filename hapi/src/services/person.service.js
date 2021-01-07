const { hasuraUtil } = require('../utils')

const findOne = async (where = {}) => {
  const query = `
    query ($where: person_bool_exp!) {
      person(where: $where, limit: 1) {
        id
        name
        account
      }
    }
  `
  const { person: data } = await hasuraUtil.request(query, { where })

  if (data && data.length > 0) {
    return data[0]
  }

  return null
}

const setAccount = async (id, account) => {
  const mutation = `
      mutation ($id: uuid!, $account: String!) {
        update_person_by_pk(pk_columns: { id: $id }, _set: { account: $account }) {
          id
        }
      }
    `
  await hasuraUtil.request(mutation, { id, account })
}

module.exports = {
  findOne,
  setAccount
}
