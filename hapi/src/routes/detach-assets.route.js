const Joi = require('joi')

const { assetService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/detach-assets',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    assetService.detachAssets(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          parent: Joi.string().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
