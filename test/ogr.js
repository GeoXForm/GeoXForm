const test = require('tape')
const Ogr = require('../src/lib/ogr')

test('Create a command for a csv when there are x y properties', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    format: 'csv',
    fields: ['foo', 'bar', 'X', 'y'],
    geometryType: 'Point'
  }

  const cmd = Ogr.createCmd(options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})

test('Create a command for a csv when there are not x or y features', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    format: 'csv',
    fields: ['foo', 'bar'],
    geometryType: 'Point'
  }

  const cmd = Ogr.createCmd(options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -lco GEOMETRY=AS_XY -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})

test('Create a command for a csv when there is no geometry', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    format: 'csv',
    fields: ['foo', 'bar'],
    geometryType: null
  }

  const cmd = Ogr.createCmd(options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})

test('Create a command for a shapefile', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    format: 'zip',
    geometryType: 'Point'
  }

  const cmd = Ogr.createCmd(options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f "ESRI Shapefile" ./dummy layer.vrt -nlt POINT -fieldmap identity -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})

test('Creat the command for a shapefile when a wkt is passed in', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    wkt: 'PROJECTION',
    format: 'zip',
    geometryType: 'Point'
  }

  const cmd = Ogr.createCmd(options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f "ESRI Shapefile" ./dummy layer.vrt -nlt POINT -t_srs \'PROJECTION\' -fieldmap identity -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})
