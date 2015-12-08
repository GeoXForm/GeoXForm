// take in a stream of geojson and produce a vrt
const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')

function write (stream, path, options) {
  let n = 0
  const returned = _()
  const size = options.size || 5000
  const vrtStream = createVrtStream(path)

  stream.batch(size).tap(function (batch) {
    n++
    addVrtPart(batch, n, path, vrtStream)
  })
  .errors((err) => {
    stream.destroy()
    returned.emit('error', err)
  })
  .done(() => {
    endVrtSteam(vrtStream)
    returned.end()
  })

  return returned
}

function addVrtPart (batch, n, path, stream) {
  const fileName = `${path}/part.${n}.json`
  addMetadata(stream, fileName)
  writeJsonPart(batch, fileName)
}

function addMetadata (stream, fileName) {
  stream.write(`<OGRVRTLayer name="OGRGeoJSON"><SrcDataSource>${fileName}</SrcDataSource></OGRVRTLayer>`)
}

function writeJsonPart (batch, fileName) {
  const fileStream = _(fs.createWriteStream(fileName))
  return Geojson.write(_(batch), fileStream)
}

function createVrtStream (path) {
  const vrtStream = fs.createWriteStream(`${path}/layer.vrt`)
  vrtStream.write('<OGRVRTDataSource>')
  return vrtStream
}

function endVrtSteam (stream) {
  stream.write('</OGRVRTDataSource>')
  stream.end()
}

module.exports = {
  write: write
}
