module.exports = {
  secret: process.env.HAPI_JWT_SECRET,
  iss: process.env.HAPI_JWT_ISS,
  algorithm: process.env.HAPI_JWT_ALGORITHM
}
