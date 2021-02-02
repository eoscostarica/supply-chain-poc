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
          order: Joi.string().required(),
          lot: Joi.string().required(),
          exp: Joi.date().required(),
          pallets: Joi.number().required(),
          cases: Joi.number().required(),
          vaccines: Joi.number().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
