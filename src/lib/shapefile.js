const _ = require('highland')
const Ogr = require('./ogr')
const sanitize = require('sanitize-filename')
const exec = require('child_process').exec
const fs = require('fs')
const path = require('path')

module.exports = {
  write: function (options) {
    const outStream = _()
    options.name = sanitize(options.name)
    Ogr.execute(options, (err, folder) => {
      if (err) {
        outStream.emit('error', new Error('Call to OGR failed'))
      } else {
        if (options.metadata) fs.writeFileSync(`${folder}/${options.name}.xml`, options.metadata)
        createZipStream(folder)
        .on('error', e => outStream.emit('error', e))
        .pipe(outStream)
      }
    })
    return outStream
  }
}

function createZipStream (input) {
  const zipStream = _()
  const cmd = ['zip', '-rj', `"${input}.zip"`, `"${input}"`, '--exclude=*.json*', '--exclude=*.vrt']
  console.log(cmd.join(' '))
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
