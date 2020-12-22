const Joi = require('joi')

const { assetService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/create-batch',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    assetService.createBatch(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          order: Joi.string().required(),
          lot: Joi.string().required(),
          exp: Joi.date().required(),
          quantity: Joi.number().required(),
          type: Joi.string().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
