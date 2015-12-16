const VRT = require('./lib/vrt')
const OGR = require('./lib/ogr')
const _ = require('highland')

function createStream (format, options) {
  const stream =  _.pipeline(stream => {
    return stream
    .pipe(VRT.createStream(options))
    .on('log', l => stream.emit('log', l))
    .on('error', e => stream.emit('error', e))
    .pipe(OGR.createStream(format, options))
    .on('log', l => stream.emit('log', l))
    .on('error', e => stream.emit('error', e))
  })
  return stream
}

module.exports = {
  GeoJSON: require('./lib/geojson'),
  OGR,
  VRT,
  createStream
}
