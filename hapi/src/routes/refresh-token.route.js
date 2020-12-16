const Joi = require('joi')

const { userService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/refresh-token',
  handler: ({ payload: { input } }) => userService.refreshToken(input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          token: Joi.string().required()
        }).required()
      }).options({ stripUnknown: true })
    },
    auth: false
  }
}
