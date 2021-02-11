const Joi = require('joi')

const { assetService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/burn-assets',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    assetService.burn(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          assets: Joi.array().required(),
          description: Joi.string().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
