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
    let stat
    try {
      stat = fs.statSync(zipPath)
    } catch (e) {
      t.fail('Zip not written sucessfully')
    }
    const greater = stat.size >= 2927
    t.equal(greater, true, 'Zip written successfully')
  })
})

test('Convert geojson to shapefile with a wkt', t => {
  t.plan(1)
  const geojson = fs.createReadStream(`${__dirname}/fixtures/fc.geojson`)
  const options = {path: `${__dirname}/output`, name: 'test'}
  options.srs = 'PROJCS["S-JTSK_Krovak_East_North",GEOGCS["GCS_S_JTSK",DATUM["Jednotne_Trigonometricke_Site_Katastralni",SPHEROID["Bessel_1841",6377397.155,299.1528128]],TOWGS84[589,76,480,0,0,0,0],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Krovak"],PARAMETER["False_Easting",0],PARAMETER["False_Northing",0],PARAMETER["Pseudo_Standard_Parallel_1",78.5],PARAMETER["Scale_Factor",0.9999],PARAMETER["Azimuth",30.28813975277778],PARAMETER["Longitude_Of_Center",24.83333333333333],PARAMETER["Latitude_Of_Center",49.5],PARAMETER["X_Scale",-1],PARAMETER["Y_Scale",1],PARAMETER["XY_Plane_Rotation",90],UNIT["Meter",1],AUTHORITY["EPSG","102067"]]'
  const zipPath = `${__dirname}/output/xformed.zip`
  geojson
  .pipe(GeoXForm.createStream('zip', options))
  .pipe(fs.createWriteStream(zipPath))
  .on('finish', () => {
    let stat
    try {
      stat = fs.statSync(zipPath)
    } catch (e) {
      t.fail('Zip not written sucessfully')
    }
    const greater = stat.size >= 2927
    t.equal(greater, true, 'Zip written successfully')
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
