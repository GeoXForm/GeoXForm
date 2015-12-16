const _ = require('highland')

function createStream (options) {
  const start = '{"type":"FeatureCollection","features":['
  const end = ']}'
  const readStream = _.pipeline(s => {
   const features = options && options.json ? _(s).compact().map(JSON.stringify) : _(s).compact()
   return  _([start])
   .concat(features.intersperse(','))
   .append(end)
  })
  return readStream
}

module.exports = {createStream}
