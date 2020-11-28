import classnames from 'classnames'
import { useEffect, useState } from 'react'

import Button from '~/components/button'
import DefaultLayout from '~/layouts/default'
import Input from '~/components/input'
import LeftBottomPane from '~/components/left-bottom-pane'
import LeftTopPane from '~/components/left-top-pane'
import RightBottomPane from '~/components/right-bottom-pane'
import RightTopPane from '~/components/right-top-pane'
import styles from '~/pages/index.module.scss'
import { useWebSocket } from '~/contexts/websocket-context'

function IndexPage () {
  const [ctx, setCtx] = useState(null)
  const [password, setPassword] = useState('')
  const { error, isAuthenticated, signIn, ws } = useWebSocket()

  useEffect(() => {
    if (isAuthenticated) {
      ws.emit('context')

      const listenerId = ws.addListener('context', data => setCtx(data))

      return () => {
        ws.removeListener(listenerId)
      }
    }
  }, [])

  function handlePrivateChangePassword (e) {
    setPassword(e.target.value)
  }

  function handlePrivateSubmitForm (e) {
    e.preventDefault()

    if (password === process.env.NEXT_PUBLIC_PASSWORD) {
      signIn(password)
    } else {
      setPassword('')
    }
  }

  if (!isAuthenticated) {
    return (
      <DefaultLayout className={styles['index-page']}>
        <form
          className={styles['index-page__private-form']}
          onSubmit={handlePrivateSubmitForm}
        >
          <h1 className={styles['index-page__private-headline']}>
            Site is private
          </h1>
          {error && (
            <p className={styles['index-page__private-error']}>
              An error occurred while connecting to server.
            </p>
          )}
          <Input
            className={styles['index-page__private-input']}
            id='password'
            label='Password'
            onChange={handlePrivateChangePassword}
            placeholder='Enter password...'
            required
            type='password'
            value={password}
          />
          <Button type='submit'>
            Submit
          </Button>
        </form>
      </DefaultLayout>
    )
  }

  return ctx && (
    <DefaultLayout className={styles['index-page']}>
      <LeftTopPane
        className={
          classnames(
            styles['index-page__pane'],
            styles['index-page__left-top']
          )
        }
        ctx={ctx}
      />
      <RightTopPane
        className={
          classnames(
            styles['index-page__pane'],
            styles['index-page__right-top']
          )
        }
        ctx={ctx}
      />
      <LeftBottomPane
        className={
          classnames(
            styles['index-page__pane'],
            styles['index-page__left-bottom']
          )
        }
        ctx={ctx}
      />
      <RightBottomPane
        className={
          classnames(
            styles['index-page__pane'],
            styles['index-page__right-bottom']
          )
        }
      />
      <span
        className={
          classnames(
            styles['index-page__delimiter'],
            styles['index-page__delimiter--horizontal']
          )
        }
      />
      <span
        className={
          classnames(
            styles['index-page__delimiter'],
            styles['index-page__delimiter--vertical']
          )
        }
      />
    </DefaultLayout>
  )
}

export default IndexPage
