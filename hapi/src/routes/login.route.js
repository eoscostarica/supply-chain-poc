const Joi = require('joi')

const { userService } = require('../services')

module.exports = {
  method: 'POST',
  path: '/login',
  handler: ({ payload: { input } }) => userService.login(input),
  options: {
    validate: {
      payload: Joi.object({
        input: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required()
        }).required()
      }).options({ stripUnknown: true })
    },
    auth: false
  }
}
