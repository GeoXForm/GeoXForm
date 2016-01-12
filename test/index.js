/* @flow */
'use strict'
const GeoXForm = require('../src')
const test = require('tape')
const Helper = require('./helper')
const fs = require('fs')
const _ = require('highland')

test('Set up', t => {
  Helper.before()
  t.end()
})

test('Convert geojson to kml', t => {
  t.plan(1)
  const geojson = fs.createReadStream(`${__dirname}/fixtures/fc.geojson`)
  const options = {path: `${__dirname}/output`}
  const rows = []
  geojson
  .pipe(GeoXForm.createStream('kml', options))
  .splitBy('<Placemark>')
  .compact()
  .each(row => rows.push(row))
  .done(() => t.equal(rows.length, 101, 'KML generated successfully'))
})

test('Convert geojson to csv', t => {
  t.plan(1)
  const geojson = fs.createReadStream(`${__dirname}/fixtures/fc.geojson`)
  const options = {path: `${__dirname}/output`}
  const rows = []
  geojson
  .pipe(GeoXForm.createStream('csv', options))
  .split()
  .compact()
  .each(row => rows.push(row))
  .done(() => t.equal(rows.length, 101, 'CSV generated successfully'))
})

test('Convert geojson to shapefile', t => {
  t.plan(1)
  const geojson = fs.createReadStream(`${__dirname}/fixtures/fc.geojson`)
  const options = {path: `${__dirname}/output`, name: 'test'}
  const zipPath = `${__dirname}/output/xformed.zip`
  geojson
  .pipe(GeoXForm.createStream('zip', options))
  .pipe(fs.createWriteStream(zipPath))
  .on('finish', () => {
    try {
      const stat = fs.statSync(zipPath)
      t.equal(stat.size, 2927, 'Zip written successfully')
    } catch (e) {
      t.fail('Zip not written sucessfully')
    }
  })
})

test('Fail gracefully', t => {
  t.plan(1)
  const options = {path: `${__dirname}/output`, name: 'test'}
  const zipPath = `${__dirname}/output/xformed.zip`
  t.plan(1)
  _(fs.createReadStream(`${__dirname}/fixtures/bad.txt`))
  .pipe(GeoXForm.createStream('zip', options))
  .on('error', e => {
    t.ok(e, 'Error was emitted')
  })
  .pipe(fs.createWriteStream(zipPath))
})

test('Teardown', t => {
  Helper.after()
  t.end()
})
