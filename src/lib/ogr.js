/* @flow */
'use strict'
const spawn = require('child_process').spawn
const _ = require('highland')
const sanitize = require('sanitize-filename')
const Shapefile = require('./shapefile')
const Cmd = require('./ogr-cmd')

function createStream (format, options) {
  options.input = options.input || `${options.path}/layer.vrt`
  const output = _()
  options.name = options.name ? sanitize(options.name) : 'output'
  const ogrStream = format === 'zip' ? createShp(options) : spawnOgr(format, options)
  ogrStream
  .on('log', l => output.emit('log', l))
  .on('error', e => output.emit('error', e))
  .pipe(output)

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
