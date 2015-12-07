// take in a stream of geojson and produce a vrt
const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')

function makeVrt (stream, path) {
  let n
  const returned = _()
  stream.batch(5000).toArray(function (batch) {
    n++
    const fileStream = fs.createWriteStream(`${path}/part.${n}.json`)
    return Geojson.write(_(batch), fileStream)
  }).done(function () {
    returned.end()
  }).errors(function (error) {
    returned.emit('error', error)
  })
  return returned
}

module.exports = {
  makeVrt: makeVrt
}
