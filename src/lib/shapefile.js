/* @flow */
'use strict'
const _ = require('highland')
const fs = require('fs')
const path = require('path')
const child = require('child_process')
const spawn = child.spawn
const exec = child.exec
const Cmd = require('./ogr-cmd')

function createStream (options) {
  const readStream = _()
  const cmd = Cmd.create('zip', options)
  const ogr = spawn('ogr2ogr', cmd)
  .on('close', (c, msg) => {
    if (c > 0) {
      readStream.emit('error', new Error(`OGR Failed: ${msg}`))
      readStream.destroy()
    } else {
      const folder = `${options.path}/${options.name}`
      if (options.metadata) fs.writeFileSync(`${folder}/${options.name}.xml`, options.metadata)
      createZipStream(folder)
      .on('error', e => readStream.emit('error', e))
      .pipe(readStream)
    }
  })

  _(ogr.stderr)
  .split()
  .each(data => {
    const msg = data.toString()
    if (msg.match(/ERROR\s[^16]/) || msg.match(/2GB file size limit reached/)) {
      readStream.emit('log', { level: 'error', msg: msg })
      ogr.stderr.unpipe()
      ogr.kill('SIGKILL')
      ogr.emit('close', 1, msg)
    }
  })

  readStream.abort = () => {
    ogr.stderr.unpipe()
    ogr.kill('SIGKILL')
    ogr.emit('close', 1, 'Aborted')
  }

  return readStream
}

function createZipStream (input) {
  const zipStream = _()
  const cmd = ['zip', '-rj', `"${input}.zip"`, `"${input}"`, '--exclude=*.json*', '--exclude=*.vrt']
  renameFiles(input)
  exec(cmd.join(' '), (err, stdout, stderr) => {
    if (err) return zipStream.emit('error', new Error('Failed while zipping'))
    fs.createReadStream(`${input}.zip`).pipe(zipStream)
  })
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
