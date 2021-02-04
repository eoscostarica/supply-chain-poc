const Joi = require('joi')

const { vaccineService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/create-gs1-assets',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    vaccineService.createGS1Assets(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          manufacturer: Joi.string().required(),
          product: Joi.string().required(),
          doses: Joi.string().required(),
          order: Joi.string()
            .optional()
            .allow(''),
          lot: Joi.string().required(),
          exp: Joi.date().required(),
          cases: Joi.number().required(),
          vaccines: Joi.number().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
