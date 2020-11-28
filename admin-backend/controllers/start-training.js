const possibleOptions = require('../possible-options.json')
const redis = require('../modules/redis')
const train = require('./train')

module.exports = async function startTraining (params, data) {
  const { learningRate = '', strategy = '' } = data

  if (
    params.ctx.training ||
    params.ctx.trained ||
    !(strategy in possibleOptions.strategy) ||
    !(learningRate in possibleOptions.learningRate)
  ) {
    return
  }

  const dataExists = await redis.exists('cashup_data')

  if (dataExists) {
    await redis.rename(['cashup_data', 'cashup_data_' + Date.now()])
  }

  await params.setCtx({
    training: true,
    trainingDate: params.trainingStartDate,
    trainingEnd: null,
    trainingFinished: false,
    trainingParams: [strategy, learningRate],
    trainingStart: Date.now()
  })

  params.emit.all('context', params.ctx)
  return train(params)
}
