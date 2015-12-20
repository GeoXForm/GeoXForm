const VRT = require('./lib/vrt')
const OGR = require('./lib/ogr')
const random = require('randomstring')
const rimraf = require('rimraf')
const _ = require('highland')
const mkdirp = require('mkdirp')

function createStream (format, options) {
  options = options || {}
  options.path = `${options.path || '.'}/${random.generate()}`
  mkdirp.sync(options.path)
  const stream = _.pipeline(stream => {
    const ogrStream = OGR.createStream(format, options)
    return stream
    .pipe(VRT.createStream(options))
    .on('log', l => stream.emit('log', l))
    .on('error', e => stream.emit('error', e))
    .on('properties', p => ogrStream.emit('properties', p))
    .pipe(ogrStream)
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
