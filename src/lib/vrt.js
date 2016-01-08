/* @ flow */
'use strict'
const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')
const EventEmitter = require('events').EventEmitter
const util = require('util')

function createStream (options) {
  const size = options.size || 5000

  const output = _.pipeline(stream => {
    let watcher
    let first = true
    let index = 0
    return stream
    .splitBy(',{')
    .map(filter)
    .batch(size)
    .consume((err, batch, push, next) => {
      if (err) push(err)
      if (batch === _.nil) return
      if (first) {
        watcher = new Watcher()
        watcher.on('finish', () => {
          push(null, '</OGRVRTDataSource>')
          return push(null, _.nil)
        })
        push(null, '<OGRVRTDataSource>')
        first = false
        try {
          output.emit('properties', sample(batch))
        } catch (e) {
          output.emit('error', e)
          return output.destroy()
        }
      }
      const fileName = `${options.path}/part.${index}.json`
      push(null, addMetadata(fileName))
      watcher.watch(writeJsonPart(batch, fileName, index))
      index++
      next()
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

// This object's job is to make sure that we don't close the stream until
// all the vrt parts have been fully written to disk
function Watcher () {
  this.writers = []
}
util.inherits(Watcher, EventEmitter)

Watcher.prototype.watch = function (writer) {
  this.writers.push(false)
  const index = this.writers.length - 1
  writer.on('finish', () => {
    this.writers[index] = true
    // this will emit finish when all the outstanding writers come back
    if (this.writers.indexOf(false) < 0) this.emit('finish')
  })
}

module.exports = {createStream}
