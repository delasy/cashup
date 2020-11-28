const { launch } = require('../utils')

module.exports = async function train (params) {
  const dataLen = params.ctx.trainingData.length

  const item = {
    x: dataLen === 0 ? 1 : params.ctx.trainingData[dataLen - 1].x + 1,
    y1: null,
    y2: null,
    y3: null
  }

  const date = new Date(params.ctx.trainingDate)

  while (true) {
    date.setDate(date.getDate() + 1)

    if (date.getTime() === new Date().setHours(0, 0, 0, 0)) {
      await params.setCtx({
        trained: true,
        training: false,
        trainingDate: null,
        trainingEnd: Date.now(),
        trainingFinished: true
      })

      return params.emit.all('context', params.ctx)
    }

    try {
      const dateStr = date.getFullYear() + '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
        ('0' + date.getDate()).slice(-2)

      const opts = {
        cwd: process.env.CORE_PATH
      }

      const output = await launch(
        process.env.CORE_PATH + '/scripts/prepare_and_run.py',
        [dateStr, ...params.ctx.trainingParams],
        opts
      )

      const info = output.trim().split(', ')

      item.y1 = Number.parseFloat(info[0].substr(3))
      item.y2 = Number.parseFloat(info[1].substr(3))
      item.y3 = Number.parseFloat(info[2].substr(3))

      if (!params.ctx.training) {
        return
      }

      break
    } catch {
    }

    if (!params.ctx.training) {
      return
    }
  }

  await params.setCtx({
    trainingData: [
      ...params.ctx.trainingData,
      item
    ],
    trainingDate: date.getTime()
  })

  params.emit.all('context', params.ctx)
  return train(params)
}
