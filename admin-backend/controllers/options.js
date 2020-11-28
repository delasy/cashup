const possibleOptions = require('../possible-options.json')

module.exports = function options (params, data) {
  const { key = '' } = data

  if (!(key in possibleOptions)) {
    return
  }

  const options = []

  for (const itemKey of Object.keys(possibleOptions[key])) {
    options.push({
      key: possibleOptions[key][itemKey],
      value: itemKey
    })
  }

  params.emit.sender('options', { key, options })
}
