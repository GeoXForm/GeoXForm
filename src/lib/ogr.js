const spawn = require('child_process').spawn
const _ = require('highland')
const sanitize = require('sanitize-filename')
const fs = require('fs')
const Shapefile = require('./shapefile')
const Cmd = require('./ogr-cmd')

function createStream (format, options) {
  options.input = `${options.path}/layer.vrt`
  const vrt = fs.createWriteStream(options.input)
  const output = _.pipeline(stream => {
    const temp = _()
    stream
    .pipe(vrt)
    .on('finish', () => {
      options.name = options.name ? sanitize(options.name) : 'output'
      const cmd = Cmd.create(format, options)
      if (format === 'zip') {
        Shapefile.createStream(options)
        .on('error', e => output.emit('error', e))
        .on('log', l => output.emit('log', l))
        .pipe(temp)
      } else {
        const ogr = spawn('ogr2ogr', cmd)
        // TODO can I just pipe out vs writing to temp?
        ogr.stdout.on('data', data => temp.write(data))
        ogr.stderr.on('data', data => output.emit('log', {level: 'debug', message: data.toString()}))
        ogr.on('close', c => {
          output.emit('log', {level: 'info', message: `Executing: OGR2OGR ${cmd.join(' ')}`})
          if (c > 0) output.emit('error', new Error('OGR Failed'))
          else temp.end()
        })
      }
    })
    return temp
  })
  .on('properties', p => Object.assign(options, p))

  return output
}

module.exports = {createStream}
