const VRT = require('./lib/vrt')
const OGR = require('./lib/ogr')
const random = require('randomstring')
const rimraf = require('rimraf')
const _ = require('highland')

function createStream (format, options) {
  options.path = `${options.path || '.'}/${random.generate()}`
  const stream = _.pipeline(stream => {
    return stream
    .pipe(VRT.createStream(options))
    .on('log', l => stream.emit('log', l))
    .on('error', e => stream.emit('error', e))
    .pipe(OGR.createStream(format, options))
    .on('log', l => stream.emit('log', l))
    .on('error', e => stream.emit('error', e))
    .on('end', e => rimraf(options.path, err => {
      if (err) stream.emit('log', {level: 'error', message: 'Failed to delete temporary directory'})
    }))
  })
  return stream
}

module.exports = {
  GeoJSON: require('./lib/geojson'),
  OGR,
  VRT,
  createStream
}
