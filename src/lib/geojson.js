const _ = require('highland')

function geojson (cache, table, options) {
  const featureStream = cache.createExportStream(table, options)
  const uploadStream = files.createWriteStream(options.path)
  return createReadStream(featureStream, uploadStream)
}

function createReadStream (input, options) {
  const start = '{"type":"FeatureCollection","features":['
  const end = ']}'
  const features = options && options.json ? _(input).compact().map(JSON.stringify) : _(input).compact()
  const readStream = _([start])
  .concat(features.intersperse(','))
  .append(end)

  return readStream
}

module.exports = {
  geojson: geojson,
  createReadStream: createReadStream
}
