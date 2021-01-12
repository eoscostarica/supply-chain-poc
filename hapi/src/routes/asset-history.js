const Joi = require('joi')

const { historyService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/asset-history',
  handler: ({ payload: { input } }) => historyService.getHistory(input.id),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          id: Joi.string().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
