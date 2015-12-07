const _ = require('highland')
var files = require('koop').files

function geojson (cache, table, options) {
  const featureStream = cache.createExportStream(table, options)
  const writeStream = files.createWriteStream(options.path)

}

function writeGeoJson (in, out) {
  return  _([start])
  .concat(in)
  .intersperse(',')
  .append(end)
  .pipe(out)
}

const start = '"{"type":"FeatureCollection","features":["'
const end = ']}'
