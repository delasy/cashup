/* eslint-env browser */

import PropTypes from 'prop-types'
import { createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const WebsocketContext = createContext(null)

function signIn (token) {
  const expirationDate = Date.now() + 24 * 60 * 60 * 1000

  document.cookie = `Authorization=${token}; ` +
    'expires=' + new Date(expirationDate).toUTCString() + '; path=/'

  window.location.reload(false)
}

async function createWebSocketContext () {
  const rawCookies = (document.cookie || '').split('; ')
  const cookies = {}

  for (const rawCookie of rawCookies) {
    const parts = rawCookie.split('=')
    cookies[parts[0].toLowerCase()] = parts[1] || ''
  }

  const listeners = []

  const ctx = {
    error: null,
    isAuthenticated: false,
    signIn: signIn,
    ws: null
  }

  const { authorization = '' } = cookies

  if (authorization && !('WebSocket' in window)) {
    ctx.error = new Error('WebSocket is not supported')
  } else if (authorization) {
    await new Promise((resolve) => {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_ENDPOINT)

      ws.onclose = () => {
        if (ctx.error === null) {
          window.location.reload(false)
        }
      }

      ws.onerror = (err) => {
        ctx.error = err
        resolve()
      }

      ws.onmessage = (buffer) => {
        let payload = null

        try {
          payload = JSON.parse(buffer.data)
        } catch {
        }

        if (payload === null || typeof payload.event !== 'string') {
          return
        }

        for (const listener of listeners) {
          if (listener.event === payload.event) {
            listener.handler(payload.data)
          }
        }
      }

      ws.onopen = () => {
        ctx.isAuthenticated = true

        ctx.ws = {
          addListener: (eventName, handler) => {
            const id = uuidv4()

            listeners.push({
              event: eventName,
              handler: handler,
              id: id
            })

            return id
          },
          emit: (eventName, data = null) => {
            const payload = JSON.stringify({
              event: eventName,
              data: data
            })

            ws.send(payload)
          },
          removeListener: (listenerId) => {
            let i = listeners.length

            while (i--) {
              if (listeners[i].id === listenerId) {
                listeners.splice(i, 1)
                break
              }
            }
          }
        }

        resolve()
      }
    })
  }

  return ctx
}

export function WebSocketProvider ({ children }) {
  const [ctx, setCtx] = useState(null)

  useEffect(() => {
    createWebSocketContext().then(value => setCtx(value))
  }, [])

  return (
    <WebsocketContext.Provider value={ctx}>
      {ctx && children}
    </WebsocketContext.Provider>
  )
}

WebSocketProvider.defaultProps = {
  children: null
}

WebSocketProvider.propTypes = {
  children: PropTypes.node
}

export function useWebSocket () {
  return useContext(WebsocketContext)
}

export default WebsocketContext
