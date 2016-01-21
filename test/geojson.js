/* global __dirname */
const _ = require('highland')
const GeoJson = require('../src/lib/geojson')
const test = require('tape')
const fs = require('fs')
const Helper = require('./helper')

const output = `${__dirname}/output`

test('Set up', t => {
  Helper.before()
  t.end()
})

test('Write valid geojson from a stream of feature strings', t => {
  t.plan(1)
  const featureStream = _(fs.createReadStream(`${__dirname}/fixtures/features.txt`)).split()
  const fileName = `${output}/test.geojson`
  const outStream = fs.createWriteStream(fileName)
  featureStream.pipe(GeoJson.createStream())
  .pipe(outStream)
  .on('finish', () => {
    const written = JSON.parse(fs.readFileSync(fileName))
    t.equal(written.features.length, 100, 'GeoJSON has expected features')
  })
})

test('Write valid geojson when there is only one feature', t => {
  t.plan(1)
  const featureStream = _(['{"type":"Feature","properties":{"FID_1":100},"geometry":{"type":"Point","coordinates":[-87.1,39.1]}}'])
  const fileName = `${output}/test-short.geojson`
  const outStream = fs.createWriteStream(fileName)
  featureStream.pipe(GeoJson.createStream())
  .pipe(outStream)
  .on('finish', () => {
    try {
      const written = JSON.parse(fs.readFileSync(fileName))
      t.equal(written.features.length, 1, 'GeoJSON has expected features')
    } catch (e) {
      t.fail('JSON could not be parsed')
    }
  })
})

test('Write valid geojson from a stream of feature objects', t => {
  t.plan(1)
  const featureStream = _(fs.createReadStream(`${__dirname}/fixtures/features.txt`)).split().compact().map(JSON.parse)
  const fileName = `${output}/test-object.geojson`
  const outStream = fs.createWriteStream(fileName)
  featureStream.pipe(GeoJson.createStream({json: true}))
  .pipe(outStream)
  .on('finish', () => {
    const written = JSON.parse(fs.readFileSync(fileName))
    t.equal(written.features.length, 100, 'GeoJSON has expected features')
  })
})

test('Teardown', t => {
  Helper.after()
  t.end()
})
