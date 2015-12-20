const GeoXForm = require('../src')
const test = require('tape')
const Helper = require('./helper')
const fs = require('fs')

test('Set up', t => {
  Helper.before()
  t.end()
})

test('Convert geojson to kml', t => {
  t.plan(1)
  const geojson = fs.createReadStream(`${__dirname}/fixtures/fc.geojson`)
  const options = {format: 'kml', path: `${__dirname}/output`, geometry: 'point'}
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
  const options = {format: 'csv', path: `${__dirname}/output`, geometry: 'point', fields: ['foo', 'bar']}
  const rows = []
  geojson
  .pipe(GeoXForm.createStream('csv', options))
  .split()
  .compact()
  .each(row => rows.push(row))
  .done(() => t.equal(rows.length, 101, 'CSV generated successfully'))
})

test('Teardown', t => {
  Helper.after()
  t.end()
})
