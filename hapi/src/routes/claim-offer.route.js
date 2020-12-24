const Joi = require('joi')

const { assetService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/claim-offer',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    assetService.claimOffer(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          assets: Joi.array().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
