module.exports = {
  method: 'GET',
  path: '/healthz',
  handler: () => 'OK',
  options: {
    auth: false
  }
}
