/* @ flow */
'use strict'
const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')

function createStream (options) {
  const size = options.size || 5000

  const output = _.pipeline(stream => {
    let first = true
    let index = 0
    return stream
    .splitBy(',{')
    .map(filter)
    .batch(size)
    .consume((err, batch, push, next) => {
      if (err) push(err)
      if (first) {
        push(null, '<OGRVRTDataSource>')
        first = false
        try {
          output.emit('properties', sample(batch))
        } catch (e) {
          output.emit('error', e)
          return output.destroy()
        }
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
  return output
}

function sample (batch) {
  let sample = batch.find(f => {
    const feature = JSON.parse(f)
    if (feature.geometry && feature.geometry.type) return true
    else return false
  })
  sample = JSON.parse(sample || batch[0])
  const geometry = sample.geometry ? sample.geometry.type : 'NONE'
  const fields = Object.keys(sample.properties)
  return {geometry, fields}
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

module.exports = {createStream}
