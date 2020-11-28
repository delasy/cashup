const train = require('./train')

module.exports = async function continueTraining (params) {
  if (params.ctx.training || !params.ctx.trained) {
    return
  }

  const trainingTimeDelta = params.ctx.trainingEnd - params.ctx.trainingStart

  await params.setCtx({
    training: true,
    trainingEnd: null,
    trainingStart: Date.now() - trainingTimeDelta
  })

  params.emit.all('context', params.ctx)
  return train(params)
}
