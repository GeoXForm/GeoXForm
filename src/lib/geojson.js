const _ = require('highland')

module.exports = {
  createReadStream: function (input, options) {
   const start = '{"type":"FeatureCollection","features":['
   const end = ']}'
   const features = options && options.json ? _(input).compact().map(JSON.stringify) : _(input).compact()
   const readStream = _([start])
   .concat(features.intersperse(','))
   .append(end)

   return readStream
 }
}
