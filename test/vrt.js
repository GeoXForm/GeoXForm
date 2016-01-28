/* @ flow */
'use strict'
const Vrt = require('../src/lib/vrt')
const GeoJSON = require('../src/lib/geojson')
const test = require('tape')
const fs = require('fs')
const Helper = require('./helper')
const _ = require('highland')

const output = `${__dirname}/output`

test('Set up', t => {
  Helper.before()
  t.end()
})

test('write a vrt', t => {
  t.plan(6)
  const vrtPath = `${output}/layer.vrt`
  fs.createReadStream(`${__dirname}/fixtures/fc.geojson`)
  .pipe(Vrt.createStream({ path: output, size: 33 }))
  .on('finish', () => {
    [0, 1, 2, 3].forEach(n => {
      const file = fs.readFileSync(`${output}/part.${n}.json`)
      try {
        JSON.parse(file)
        t.pass(`JSON part ${n + 1} of 4 parsed successfully`)
      } catch (e) {
        t.fail(`JSON part ${n + 1} of 4 could not be parsed`)
      }
    })
    t.ok(fs.statSync(vrtPath), 'VRT written')
    t.equal(fs.readFileSync(vrtPath).toString().length > 0, true, 'VRT has content')
  })
})

test('write a vrt from geojson that has a newline after the opening tags', t => {
  t.plan(6)
  const vrtPath = `${output}/layer.vrt`
  fs.createReadStream(`${__dirname}/fixtures/legacyFc.geojson`)
  .pipe(Vrt.createStream({ path: output, size: 33 }))
  .on('error', e => {
    t.fail('Failed while writing VRT')
    t.end()
  })
  .on('finish', () => {
    [0, 1, 2, 3].forEach(n => {
      const file = fs.readFileSync(`${output}/part.${n}.json`)
      try {
        JSON.parse(file)
        t.pass(`JSON part ${n + 1} of 4 parsed successfully`)
      } catch (e) {
        t.fail(`JSON part ${n + 1} of 4 could not be parsed`)
      }
    })
    t.ok(fs.statSync(vrtPath), 'VRT written')
    t.equal(fs.readFileSync(vrtPath).toString().length > 0, true, 'VRT has content')
  })
})

test('write a vrt using input from GeoJSON.createStream', t => {
  t.plan(6)
  fs.mkdirSync(`${output}/vrt2`)
  const outPath = `${output}/vrt2`
  const vrtPath = `${outPath}/layer.vrt`
  _(fs.createReadStream(`${__dirname}/fixtures/features.txt`))
  .split()
  .compact()
  .pipe(GeoJSON.createStream())
  .pipe(Vrt.createStream({ path: outPath, size: 33 }))
  .on('finish', () => {
    [0, 1, 2, 3].forEach(n => {
      const file = fs.readFileSync(`${outPath}/part.${n}.json`)
      try {
        JSON.parse(file)
        t.pass(`JSON part ${n + 1} of 4 parsed successfully`)
      } catch (e) {
        t.fail(`JSON part ${n + 1} of 4 could not be parsed`)
      }
    })
    t.ok(fs.statSync(vrtPath), 'VRT written')
    t.equal(fs.readFileSync(vrtPath).toString().length > 0, true, 'VRT has content')
  })
})

test('fail gracefully when geojson input is bad', t => {
  t.plan(3)
  fs.createReadStream(`${__dirname}/fixtures/bad.txt`)
  .pipe(Vrt.createStream({ path: output, size: 33 }))
  .on('error', e => {
    t.ok(e, 'Error emitted in expected place')
  })
  .on('finish', () => t.fail('Should not have finished'))
})

test('Teardown', t => {
  Helper.after()
  t.end()
})
