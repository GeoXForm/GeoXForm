// take in a stream of geojson and produce a vrt
const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')

function write (stream, options, callback) {
  let partsCount = 0
  const size = options.size || 5000
  const vrtStream = createVrtStream(options.path)
  const partStream = _()
  stream.batch(size).tap(batch => {
    partsCount++
    addVrtPart(batch, partsCount, options.path, vrtStream).pipe(partStream)
  })
  .errors((err) => {
    callback(err)
  })
  .done(() => {
    // we need a way to know if all the sub-streams have finished
    // there's got. to. be. a better way to do this
    partStream.each((partsWritten) => {
      if (partsWritten === partsCount) {
        endVrtSteam(vrtStream)
        callback(null)
      }
    })
  })
}

function addVrtPart (batch, index, path, stream) {
  const fileName = `${path}/part.${index}.json`
  addMetadata(stream, fileName)
  return writeJsonPart(batch, fileName, index)
}

function addMetadata (stream, fileName) {
  stream.write(`<OGRVRTLayer name="OGRGeoJSON"><SrcDataSource>${fileName}</SrcDataSource></OGRVRTLayer>`)
}

function writeJsonPart (batch, fileName, index) {
  const outStream = _()
  const fileStream = fs.createWriteStream(fileName)
  Geojson.write(_(batch), fileStream)
  .on('finish', () => { outStream.write(index) })
  return outStream
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
