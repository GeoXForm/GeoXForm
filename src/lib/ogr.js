/* @flow */
'use strict'
const spawn = require('child_process').spawn
const _ = require('highland')
const sanitize = require('sanitize-filename')
const fs = require('fs')
const Shapefile = require('./shapefile')
const Cmd = require('./ogr-cmd')

function createStream (format, options) {
  options.input = `${options.path}/layer.vrt`
  const tempVrt = fs.createWriteStream(options.input)
  const output = _.pipeline(stream => {
    // we set up this passthru so a stream can be immediately returned
    // even tho data will not start coming int until the vrt finish event
    const pass = _()
    // first write the incoming text as a temporary VRT file on disk
    stream
    .pipe(tempVrt)
    .on('error', e => output.emit('error', e))
    // when the VRT is on disk we can crank up OGR
    .on('finish', () => {
      options.name = options.name ? sanitize(options.name) : 'output'
      const ogrStream = format === 'zip' ? createShp(options) : spawnOgr(format, options)
      return ogrStream
      .on('error', e => output.emit('error', e))
      .pipe(pass)
    })
    return pass
  })
  .on('properties', p => Object.assign(options, p))

  return output
}

function spawnOgr (format, options) {
  const output = _()
  const cmd = Cmd.create(format, options)
  output.emit('log', {level: 'info', message: `Executing: OGR2OGR ${cmd.join(' ')}`})
  const ogr = spawn('ogr2ogr', cmd)
  .on('close', c => {
    if (c > 0) output.emit('error', new Error('OGR Failed'))
  })
  ogr.stderr.on('data', data => {
    const msg = data.toString()
    // Error 1: GeoJSON parsing error
    // Error 4: Failed to read GeeoJSON
    // Error 6: debug message that can be ignored
    if (msg.match(/ERROR\s[^6]/)) output.emit('error', new Error(msg))
  })
  return ogr.stdout.pipe(output)
}

function createShp (options) {
  const output = _()
  return Shapefile.createStream(options)
  .on('error', e => output.emit('error', e))
  .on('log', l => output.emit('log', l))
  .pipe(output)
}

module.exports = {createStream}
