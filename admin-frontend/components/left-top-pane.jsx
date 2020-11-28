import PropTypes from 'prop-types'
import classnames from 'classnames'
import { useEffect, useState } from 'react'

import Button from '~/components/button'
import Select from '~/components/select'
import styles from '~/components/left-top-pane.module.scss'
import { useWebSocket } from '~/contexts/websocket-context'

function LeftTopPane ({ className, ctx, ...props }) {
  const [learningRate, setLearningRate] = useState('0.05')
  const [learningRateOptions, setLearningRateOptions] = useState([])
  const [strategy, setStrategy] = useState('NN')
  const [strategyOptions, setStrategyOptions] = useState([])
  const { ws } = useWebSocket()

  useEffect(() => {
    ws.emit('options', { key: 'learningRate' })
    ws.emit('options', { key: 'strategy' })

    const listenerId = ws.addListener('options', (data) => {
      if (data.key === 'learningRate') {
        setLearningRateOptions(data.options)
      } else if (data.key === 'strategy') {
        setStrategyOptions(data.options)
      }
    })

    return () => {
      ws.removeListener(listenerId)
    }
  }, [])

  function handleChangeLearningRate (e) {
    setLearningRate(e.target.value)
  }

  function handleChangeStrategy (e) {
    setStrategy(e.target.value)
  }

  function handleContinueTraining () {
    ws.emit('continue-training')
  }

  function handlePauseTraining () {
    ws.emit('pause-training')
  }

  function handleReset () {
    ws.emit('reset')
  }

  function handleRestartTraining () {
    ws.emit('restart-training')
  }

  function handleSubmitForm (e) {
    e.preventDefault()
    ws.emit('start-training', { learningRate, strategy })
  }

  const containerClassName = classnames(className, styles['left-top-pane'])

  return (
    <div className={containerClassName} {...props}>
      <div className={styles['left-top-pane__header']}>
        <h1 className={styles['left-top-pane__header-headline']}>
          Configuration
        </h1>
        <Button
          className={styles['left-top-pane__header-reset']}
          disabled={!ctx.trained && !ctx.training}
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
      <form
        className={styles['left-top-pane__form']}
        onSubmit={handleSubmitForm}
      >
        <div className={styles['left-top-pane__form-body']}>
          <Select
            className={styles['left-top-pane__strategy']}
            disabled={ctx.trained || ctx.training}
            id='strategy'
            label='Strategy'
            onChange={handleChangeStrategy}
            value={strategy}
          >
            {strategyOptions.map((option) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.key}
                </option>
              )
            })}
          </Select>
          <Select
            className={styles['left-top-pane__learning-rate']}
            disabled={ctx.trained || ctx.training}
            id='learning_rate'
            label='Learning Rate'
            onChange={handleChangeLearningRate}
            value={learningRate}
          >
            {learningRateOptions.map((option) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.key}
                </option>
              )
            })}
          </Select>
        </div>
        <div className={styles['left-top-pane__actions']}>
          {!ctx.trained && !ctx.training && (
            <Button
              className={styles['left-top-pane__action']}
              type='submit'
            >
              Start Training
            </Button>
          )}
          {ctx.trained && !ctx.training && !ctx.trainingFinished && (
            <Button
              className={styles['left-top-pane__action']}
              onClick={handleContinueTraining}
              type='button'
            >
              Continue Training
            </Button>
          )}
          {ctx.trained && !ctx.training && ctx.trainingFinished && (
            <Button
              className={styles['left-top-pane__action']}
              onClick={handleRestartTraining}
              type='button'
            >
              Restart Training
            </Button>
          )}
          {ctx.training && (
            <Button
              className={styles['left-top-pane__action']}
              onClick={handlePauseTraining}
              type='button'
            >
              Pause Training
            </Button>
          )}
          {ctx.trained && !ctx.training && (
            <Button
              className={styles['left-top-pane__action']}
              type='button'
            >
              Start Live
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

LeftTopPane.defaultProps = {
  className: ''
}

LeftTopPane.propTypes = {
  className: PropTypes.string,
  ctx: PropTypes.object.isRequired
}

export default LeftTopPane
