// take in a stream of geojson and produce a vrt
const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')

function write (stream, path, options) {
  let n = 0
  const size = options.size || 5000
  const returned = _()
  stream.batch(size).tap(function (batch) {
    n++
    const fileStream = fs.createWriteStream(`${path}/part.${n}.json`)
    return Geojson.write(_(batch), fileStream)
  })
  .errors(function (error) {
    returned.emit('error', error)
    stream.destroy()
  })
  .done(function () {
    returned.end()
  })

  return returned
}

module.exports = {
  write: write
}
