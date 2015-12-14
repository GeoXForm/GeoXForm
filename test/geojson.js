/* global __dirname */
const _ = require('highland')
const GeoJson = require('../src/lib/geojson')
const test = require('tape')
const rimraf = require('rimraf')
const fs = require('fs')
const Helper = require('./helper')

const output = `${__dirname}/output`

test('Set up', t => {
  Helper.before()
  t.end()
})

test('Write valid geojson from a stream of feature strings', function (t) {
  t.plan(1)
  const featureStream = _(fs.createReadStream(`${__dirname}/fixtures/features.txt`)).split()
  const fileName = `${output}/test.geojson`
  const outStream = fs.createWriteStream(fileName)
  GeoJson.createReadStream(featureStream)
  .pipe(outStream)
  .on('finish', () => {
    const written = JSON.parse(fs.readFileSync(fileName))
    t.equal(written.features.length, 100, 'GeoJSON has expected features')
  })
})

test('Write valid geojson from a stream of feature objects', function (t) {
  t.plan(1)
  const featureStream = _(fs.createReadStream(`${__dirname}/fixtures/features.txt`)).split().compact().map(JSON.parse)
  const fileName = `${output}/test.geojson`
  const outStream = fs.createWriteStream(fileName)
  GeoJson.createReadStream(featureStream, {json: true})
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
