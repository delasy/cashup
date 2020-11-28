module.exports = async function pauseTraining (params) {
  if (!params.ctx.training) {
    return
  }

  await params.setCtx({
    trained: true,
    training: false,
    trainingEnd: Date.now()
  })

  params.emit.all('context', params.ctx)
}
