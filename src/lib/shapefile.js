const _ = require('highland')
const fs = require('fs')
const path = require('path')
const Ogr = require('./ogr')
const exec = require('child_process').exec

module.exports = {
  createReadStream: function (options) {
    const readStream = _()
    const cmd = `ogr2ogr ${Ogr.createCmd(options).join(' ')}`

    exec(cmd, err => {
      if (err) return readStream.emit('error', new Error('Call to OGR failed'))
      const folder = `${options.path}/${options.name}`
      if (options.metadata) fs.writeFileSync(`${folder}/${options.name}.xml`, options.metadata)
      createZipStream(folder)
      .on('error', e => readStream.emit('error', e))
      .pipe(readStream)
    })
    return readStream
  }
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
