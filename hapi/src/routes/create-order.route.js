const Joi = require('joi')

const { assetService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/create-order',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    assetService.createOrder(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          manufacturer: Joi.string().required(),
          product: Joi.string().required(),
          quantity: Joi.number().required(),
          type: Joi.string().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
