const _ = require('highland')
var files = require('koop').files

function geojson (cache, table, options) {
  const featureStream = cache.createExportStream(table, options)
  const uploadStream = files.createWriteStream(options.path)
  return write(featureStream, uploadStream)
}

function write (input, output) {
  const start = '{"type":"FeatureCollection","features":["'
  const end = ']}'

  return _([start])
  .concat(input)
  .intersperse(',')
  .append(end)
  .pipe(output)
}

module.exports = {
  geojson: geojson,
  write: write
}
