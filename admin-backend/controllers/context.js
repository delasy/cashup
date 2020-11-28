module.exports = function context (params) {
  params.emit.sender('context', params.ctx)
}
