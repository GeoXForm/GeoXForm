/* @flow */
'use strict'
const _ = require('highland')
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const Cmd = require('./ogr-cmd')

function createStream (options) {
  const readStream = _()
  const cmd = `ogr2ogr ${Cmd.create('zip', options).join(' ')}`
  const ogr = exec(cmd, err => {
    if (err) return readStream.emit('error', new Error('Call to OGR failed'))
    const folder = `${options.path}/${options.name}`
    if (options.metadata) fs.writeFileSync(`${folder}/${options.name}.xml`, options.metadata)
    createZipStream(folder)
    .on('error', e => readStream.emit('error', e))
    .pipe(readStream)
  })
  process.on('SIGTERM', () => ogr.kill())
  return readStream
}

function createZipStream (input) {
  const zipStream = _()
  const cmd = ['zip', '-rj', `"${input}.zip"`, `"${input}"`, '--exclude=*.json*', '--exclude=*.vrt']
  renameFiles(input)
  const zip = exec(cmd.join(' '), (err, stdout, stderr) => {
    if (err) return zipStream.emit('error', new Error('Failed while zipping'))
    fs.createReadStream(`${input}.zip`).pipe(zipStream)
  })
  process.on('SIGTERM', () => zip.kill())
  return zipStream
}

function renameFiles (input) {
  fs.readdirSync(input).forEach(file => {
    const oldName = path.join(input, file)
    const newName = oldName.replace(/ogrgeojson/i, path.basename(input))
    fs.renameSync(oldName, newName)
  })
}

module.exports = {createStream}
