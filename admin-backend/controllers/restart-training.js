const train = require('./train')

module.exports = async function restartTraining (params) {
  if (
    params.ctx.training ||
    (params.ctx.trained && !params.ctx.trainingFinished)
  ) {
    return
  }

  const trainingTimeDelta = params.ctx.trainingEnd - params.ctx.trainingStart

  await params.setCtx({
    training: true,
    trainingDate: params.trainingStartDate,
    trainingEnd: null,
    trainingFinished: false,
    trainingStart: Date.now() - trainingTimeDelta
  })

  params.emit.all('context', params.ctx)
  return train(params)
}
