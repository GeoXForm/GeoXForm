const test = require('tape')
const Cmd = require('../src/lib/ogr-cmd')

test('Create a command for a csv when there are x y properties', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    fields: ['foo', 'bar', 'X', 'y'],
    geometry: 'Point'
  }

  const cmd = Cmd.create('csv', options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})

test('Create a command for a csv when there are not x or y features', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    format: 'csv',
    fields: ['foo', 'bar'],
    geometry: 'Point'
  }

  const cmd = Cmd.create('csv', options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -lco GEOMETRY=AS_XY -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})

test('Create a command for a csv when there is no geometry', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    format: 'csv',
    fields: ['foo', 'bar'],
    geometry: null
  }

  const cmd = Cmd.create('csv', options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f CSV /vsistdout/ layer.vrt -lco WRITE_BOM=YES -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})

test('Create a command for a shapefile', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    geometry: 'Point'
  }

  const cmd = Cmd.create('zip', options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f ESRI Shapefile ./dummy layer.vrt -nlt POINT -fieldmap identity -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})

test('Create the command for a shapefile when a srs is passed in', t => {
  t.plan(1)
  const options = {
    name: 'dummy',
    srs: 'PROJECTION',
    geometry: 'Point'
  }

  const cmd = Cmd.create('zip', options)
  t.equal(cmd.join(' '), '--config SHAPE_ENCODING UTF-8 -f ESRI Shapefile ./dummy layer.vrt -nlt POINT -fieldmap identity -t_srs PROJECTION -append -skipfailures -lco ENCODING=UTF-8', 'Correct command')
})
