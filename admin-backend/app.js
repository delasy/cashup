require('dotenv').config()

const http = require('http')
const WebSocket = require('ws')

const controllers = require('./controllers')
const redis = require('./modules/redis')
const { authenticate, createContext } = require('./utils')

const httpServer = http.createServer()
const wss = new WebSocket.Server({ noServer: true })

const clients = {}
const ctx = createContext()

function emitToAll (eventName, data = null) {
  const payload = JSON.stringify({
    event: eventName,
    data: data
  })

  for (const client of Object.values(clients)) {
    client.send(payload)
  }
}

httpServer.on('upgrade', async (req, socket, head) => {
  const userId = await authenticate(req)

  if (userId === null) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    return socket.destroy()
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, userId)
  })
})

wss.on('connection', (ws, userId) => {
  clients[userId] = ws

  function emitToSender (eventName, data = null) {
    const payload = JSON.stringify({
      event: eventName,
      data: data
    })

    clients[userId].send(payload)
  }

  ws.on('close', () => {
    if (clients[userId]) {
      delete clients[userId]
    }
  })

  ws.on('message', async (buffer) => {
    let payload = null

    try {
      payload = JSON.parse(buffer)
    } catch {
    }

    if (payload === null || typeof payload.event !== 'string') {
      return
    }

    const params = {
      get ctx () {
        return ctx
      },
      emit: {
        all: emitToAll,
        sender: emitToSender
      },
      setCtx: async function setCtx (data) {
        for (const key of Object.keys(data)) {
          if (Object.prototype.hasOwnProperty.call(ctx, key)) {
            ctx[key] = data[key]
          }
        }

        await redis.set('cashup_context', ctx)
      },
      trainingStartDate: new Date(2017, 0, 26, 0, 0, 0, 0).getTime()
    }

    for (const controller of controllers) {
      if (controller.event === payload.event) {
        try {
          controller.handler(params, payload.data)
        } catch (err) {
          console.error(err)
        }

        break
      }
    }
  })
})

async function main () {
  const ctxExists = await redis.exists('cashup_context')

  if (ctxExists) {
    const data = await redis.get('cashup_context')

    for (const key of Object.keys(data)) {
      if (Object.prototype.hasOwnProperty.call(ctx, key)) {
        ctx[key] = data[key]
      }
    }
  } else {
    await redis.set('cashup_context', ctx)
  }
}

main()
  .then(() => {
    httpServer.listen(parseInt(process.env.PORT) || 8081)
  })
