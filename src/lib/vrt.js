const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')
const mkdirp = require('mkdirp')

module.exports ={
  create: function (input, options, callback) {
    let partsCount = 0
    const size = options.size || 5000
    mkdirp.sync(options.path)
    const vrtStream = createVrtStream(options.path)
    const partStream = _()
    const stream = _(input)
    stream
  	.splitBy(',{')
  	.map(filter)
    .errors(err => {
      input.destroy()
      callback(err)
    })
    .batch(size)
    .tap(batch => {
      partsCount++
      addVrtPart(batch, partsCount, options.path, vrtStream).pipe(partStream)
    })
    .done(() => {
      // we need a way to know if all the sub-streams have finished
      // there's got. to. be. a better way to do this
      // TODO look at Highland nfcall
      partStream.each((partsWritten) => {
        if (partsWritten === partsCount) {
          endVrtStream(vrtStream)
          callback(null)
        }
      })
    })
  }
}

function filter (string) {
  const parts = string.split('"features":[{')
  return `{${parts[parts.length - 1]}`.replace(/]}}]}/, ']}')
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
  Geojson.createReadStream(_(batch))
  .pipe(fileStream)
  .on('finish', () => outStream.write(index))
  return outStream
}

function createVrtStream (path) {
  const vrtStream = fs.createWriteStream(`${path}/layer.vrt`)
  vrtStream.write('<OGRVRTDataSource>')
  return vrtStream
}

function endVrtStream (stream) {
  stream.write('</OGRVRTDataSource>')
  stream.end()
}
