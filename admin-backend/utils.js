const childProcess = require('child_process')
const { v4: uuidv4 } = require('uuid')

async function authenticate (req) {
  const headers = {}

  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    headers[req.rawHeaders[i].toLowerCase()] = req.rawHeaders[i + 1]
  }

  const rawCookies = (headers.cookie || '').split('; ')
  const cookies = {}

  for (const rawCookie of rawCookies) {
    const parts = rawCookie.split('=')
    cookies[parts[0].toLowerCase()] = parts[1] || ''
  }

  const { authorization = '' } = cookies
  return authorization === process.env.PASSWORD ? uuidv4() : null
}

function createContext () {
  return {
    trained: false,
    training: false,
    trainingData: [],
    trainingDate: null,
    trainingEnd: null,
    trainingFinished: false,
    trainingParams: null,
    trainingStart: null
  }
}

function launch (command, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, args, opts)

    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(stderr))
      }
    })
  })
}

module.exports = {
  authenticate,
  createContext,
  launch
}
