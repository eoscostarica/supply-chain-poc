const Joi = require('joi')

const { assetService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/update-assets',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    assetService.updateAssets(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          type: Joi.string().required(),
          assets: Joi.array().required(),
          data: Joi.object().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
