/* @ flow */
'use strict'
const VRT = require('./lib/vrt')
const OGR = require('./lib/ogr')
const random = require('randomstring')
const rimraf = require('rimraf')
const _ = require('highland')
const mkdirp = require('mkdirp')

function createStream (format, options) {
  let ogr
  options = options || {}
  options.path = `${options.tempPath || '.'}/${random.generate()}`
  mkdirp.sync(options.path)
  const output = _.pipeline(stream => {
    // init VRT stream and attach listeners otherwise the error event will be missed
    const through = _()
    const vrtStream = VRT.createStream(options)
    .on('log', l => output.emit('log', l))
    .once('error', e => {
      output.emit('error', e)
      cleanup(output, options.path)
    })
    .on('error', e => {
      output.emit('log', {level: 'error', message: e})
    })
    .on('properties', p => Object.assign(options, p))

    stream
    .pipe(vrtStream)
    .on('finish', () => {
      ogr = OGR.createStream(format, options)

      ogr
      .on('log', l => output.emit('log', l))
      .once('error', e => {
        output.emit('error', e)
        cleanup(output, options.path)
      })
      .on('error', e => output.emit('log', { level: 'error', message: e }))
      .on('end', () => cleanup(output, options.path))
      .pipe(through)
    })

    return through
  })

  output.abort = () => {
    ogr.abort()
    cleanup(output, options.path)
  }

  return output
}

function cleanup (stream, path) {
  rimraf(path, err => {
    if (err) stream.emit('log', {level: 'error', message: 'Failed to delete temporary directory'})
    stream.end()
  })
}

module.exports = {
  GeoJSON: require('./lib/geojson'),
  OGR,
  VRT,
  createStream
}
