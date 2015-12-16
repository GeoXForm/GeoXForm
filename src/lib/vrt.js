const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')
const mkdirp = require('mkdirp')

function createStream (options) {
  const size = options.size || 5000
  mkdirp.sync(options.path)

  return _.pipeline(stream => {
    let first = true
    let index = 0
    return stream
    .splitBy(',{')
    .map(filter)
    .batch(size)
    .consume((err, batch, push, next) => {
      if (first) {
        push(null, '<OGRVRTDataSource>')
        first = false
      }
      if (batch === _.nil || batch === '{}') {
        push(null, '</OGRVRTDataSource>')
        return push(null, _.nil)
      }
      const fileName = `${options.path}/part.${index}.json`
      writeJsonPart(batch, fileName, index)
      .on('finish', () => {
        push(null, addMetadata(fileName))
        index++
        next()
      })
    })
  })
}

function filter (string) {
  const parts = string.split('"features":[{')
  return `{${parts[parts.length - 1]}`.replace(/]}}]}/, ']}}')
}

function addMetadata (fileName) {
  return `<OGRVRTLayer name="OGRGeoJSON"><SrcDataSource>${fileName}</SrcDataSource></OGRVRTLayer>`
}

function writeJsonPart (batch, fileName) {
  const fileStream = fs.createWriteStream(fileName)
  return _(batch)
  .pipe(Geojson.createStream())
  .pipe(fileStream)
}

function createVrtStream (path) {
  const vrtStream = fs.createWriteStream(`${path}/layer.vrt`)
  vrtStream.write()
  return vrtStream
}

function endVrtStream (stream) {
  stream.write()
}

module.exports = {createStream}
