const Joi = require('joi')

const { vaccineService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/vaccination',
  handler: ({ auth: { credentials }, payload: { input } }) =>
    vaccineService.vaccination(credentials, input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          person: Joi.string().required(),
          lot: Joi.string().required()
        }).required()
      }).options({ stripUnknown: true })
    }
  }
}
