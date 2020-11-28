const fs = require('fs')
const path = require('path')

module.exports = fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file !== 'train.js' &&
      file.slice(-3) === '.js'
  })
  .map((file) => {
    return {
      event: file.slice(0, -3),
      handler: require(path.join(__dirname, file))
    }
  })
