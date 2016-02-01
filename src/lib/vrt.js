/* @ flow */
'use strict'
const fs = require('fs')
const Geojson = require('./geojson')
const _ = require('highland')
const EventEmitter = require('events').EventEmitter
const util = require('util')
const lodash = require('lodash')
const FeatureParser = require('feature-parser')

function createStream (options) {
  const size = options.size || 5000
  const watcher = new Watcher()
  const vrtPath = `${options.path}/layer.vrt`
  const vrt = fs.createWriteStream(vrtPath)
  vrt.write('<OGRVRTDataSource>')
  let index = 0
  let firstBatch = true
  const input = _()
  input
  .pipe(FeatureParser.parse())
  .batch(size)
  .each(batch => {
    if (firstBatch) {
      firstBatch = false
      let properties
      try {
        properties = sample(batch)
      } catch (e) {
        input.emit('log', {level: 'error', message: {error: 'Bad batch of geojson', batch}})
        input.emit('error', e)
        return input.destroy()
      }
      input.emit('properties', properties)
    }
    const fileName = `${options.path}/part.${index}.json`
    const writer = writeLayer(batch, fileName)
    watcher.watch(writer)
    vrt.write(metadata(fileName))
    index++
  })
  .done(() => {
    vrt.write('</OGRVRTDataSource>')
    if (watcher.idle) input.emit('finish', vrtPath)
    else watcher.on('idle', () => input.emit('finish', vrtPath))
  })
  return input
}

function sample (batch) {
  let sample = lodash.find(string => {
    const feature = JSON.parse(string)
    if (feature.geometry && feature.geometry.type) return true
    else return false
  })
  sample = JSON.parse(sample || batch[0])
  const geometry = sample.geometry ? sample.geometry.type : 'NONE'
  const fields = Object.keys(sample.properties)
  return {geometry, fields}
}

function metadata (fileName) {
  return `<OGRVRTLayer name="OGRGeoJSON"><SrcDataSource>${fileName}</SrcDataSource></OGRVRTLayer>`
}

function writeLayer (batch, fileName) {
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
  this.idle = false
  this.writers.push(false)
  const index = this.writers.length - 1
  writer.on('finish', () => {
    this.writers[index] = true
    // this will emit finish when all the outstanding writers come back
    if (this.writers.indexOf(false) < 0) {
      this.idle = true
      this.emit('idle')
    }
  })
}

module.exports = {createStream}
