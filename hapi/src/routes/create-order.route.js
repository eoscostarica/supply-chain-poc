const Joi = require('joi')

const { orderService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/create-order',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    orderService.create(credentials, input),
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
