const { createContext } = require('../utils')

module.exports = async function reset (params) {
  await params.setCtx(
    createContext()
  )

  params.emit.all('context', params.ctx)
}
