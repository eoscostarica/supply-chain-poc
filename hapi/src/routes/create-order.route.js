const Joi = require('joi')

const { vaccineService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/create-order',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    vaccineService.createOrder(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          manufacturer: Joi.string().required(),
          product: Joi.string().required(),
          type: Joi.string().required(),
          vaccines: Joi.number().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
