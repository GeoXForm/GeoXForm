const nock = require('nock')
const test = require('tape')
const Ogr = require('../src/lib/ogr')

test('should create a correct ogr string of commands for a csv when there are x y properties', function (t) {
  t.plan(2)
  const options = {
    name: 'dummy',
    format: 'csv',
    fields: ['foo', 'bar', 'X', 'y'],
    geometryType: 'Point'
  }

  Ogr.getCommand(options, function (err, cmd) {
    t.error(err, 'getCommand returns without an error')
    t.equal(cmd.join(' '), 'ogr2ogr --config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -append -skipfailures -lco ENCODING=UTF-8')
  })
})

test('should create a correct ogr string of commands for a csv when there are not x or y features', function (t) {
  t.plan(2)
  const options = {
    name: 'dummy',
    format: 'csv',
    fields: ['foo', 'bar'],
    geometryType: 'Point'
  }

  Ogr.getCommand(options, function (err, cmd) {
    t.error(err, 'getCommand returns without an error')
    t.equal(cmd.join(' '), 'ogr2ogr --config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -lco GEOMETRY=AS_XY -append -skipfailures -lco ENCODING=UTF-8')
  })
})

test('should create a valid ogr string for csv when there is no geometry', function (t) {
  t.plan(2)
  const options = {
    name: 'dummy',
    format: 'csv',
    fields: ['foo', 'bar'],
    geometryType: null
  }

  Ogr.getCommand(options, function (err, cmd) {
    t.error(err, 'getCommand returns without an error')
    t.equal(cmd.join(' '), 'ogr2ogr --config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -append -skipfailures -lco ENCODING=UTF-8')
  })
})

test('should create a correct ogr string of commands for a shapefile without srid', function (t) {
  t.plan(2)
  const options = {
    name: 'dummy',
    format: 'zip',
    geometryType: 'Point'
  }

  Ogr.getCommand(options, function (err, cmd) {
    t.error(err, 'getCommand returns without an error')
    t.equal(cmd.join(' '), 'ogr2ogr --config SHAPE_ENCODING UTF-8 -f "ESRI Shapefile" ./dummy layer.vrt -nlt POINT -fieldmap identity -append -skipfailures -lco ENCODING=UTF-8')
  })
})

test('should support WKID as an option for shapefiles', function (t) {
  t.plan(2)
  const options = {
    name: 'dummy',
    wkid: 102101,
    format: 'zip',
    geometryType: 'Point'
  }

  Ogr.getCommand(options, function (err, cmd) {
    t.error(err, 'getCommand returns without an error')
    t.equal(cmd.join(' '), 'ogr2ogr --config SHAPE_ENCODING UTF-8 -f "ESRI Shapefile" ./dummy layer.vrt -nlt POINT -t_srs \'PROJCS["NGO_1948_Norway_Zone_1",GEOGCS["GCS_NGO_1948",DATUM["D_NGO_1948",SPHEROID["Bessel_Modified",6377492.018,299.1528128]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",6.05625],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",58.0],UNIT["Meter",1.0]]\' -fieldmap identity -append -skipfailures -lco ENCODING=UTF-8')
  })
})

test('should create a correct ogr string of commands with a WKID', function (t) {
  t.plan(2)
  const options = {
    name: 'dummy',
    outSr: 2962,
    format: 'zip',
    geometryType: 'Point'
  }

  const fixture = nock('http://epsg.io')
  fixture.get('/2962.wkt').reply(200, 'PROJECTION')

  Ogr.getCommand(options, function (err, cmd) {
    t.error(err, 'getCommand returns without an error')
    t.equal(cmd.join(' '), 'ogr2ogr --config SHAPE_ENCODING UTF-8 -f "ESRI Shapefile" ./dummy layer.vrt -nlt POINT -t_srs \'PROJECTION\' -fieldmap identity -append -skipfailures -lco ENCODING=UTF-8')
  })
})

test('should create a correct ogr string of commands with a latest WKID', function (t) {
  t.plan(2)
  const options = {
    name: 'dummy',
    outSr: {wkid: 102646, latestWkid: 2230},
    format: 'zip',
    geometryType: 'Point'
  }

  const fixture = nock('http://epsg.io')
  fixture.get('/2230.wkt').reply(200, 'PROJECTION')

  Ogr.getCommand(options, function (err, cmd) {
    t.error(err, 'getCommand returns without an error')
    t.equal(cmd.join(' '), 'ogr2ogr --config SHAPE_ENCODING UTF-8 -f "ESRI Shapefile" ./dummy layer.vrt -nlt POINT -t_srs \'PROJECTION\' -fieldmap identity -append -skipfailures -lco ENCODING=UTF-8')
  })
})
