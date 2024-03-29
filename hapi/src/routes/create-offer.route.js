const Joi = require('joi')

const { assetService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/create-offer',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    assetService.createOffer(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          assets: Joi.array().required(),
          organization: Joi.string().required(),
          memo: Joi.string().allow(null)
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
