const _ = require('highland')
var files = require('koop').files

function geojson (cache, table, options) {
  const featureStream = cache.createExportStream(table, options)
  const uploadStream = files.createWriteStream(options.path)
  return createReadStream(featureStream, uploadStream)
}

function createReadStream (input, output, options) {
  const start = '{"type":"FeatureCollection","features":['
  const end = ']}'
  const features = options && options.json ? input.compact().map(JSON.stringify) : input.compact()
  const readStream = _([start])
  .concat(features.intersperse(','))
  .append(end)
  .pipe(output)

  return readStream
}

module.exports = {
  geojson: geojson,
  createReadStream: createReadStream
}
