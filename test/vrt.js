const _ = require('highland')
const Vrt = require('../src/lib/vrt')
const test = require('tape')
const fs = require('fs')
const rimraf = require('rimraf')
const Helper = require('./helper')

const output = `${__dirname}/output`

test('Set up', t => {
  Helper.before()
  t.end()
})

test('write a vrt', t => {
  t.plan(6)
  const stream  = fs.createReadStream(`${__dirname}/fixtures/fc.geojson`)

  Vrt.create(stream, { path: output, size: 33 }, err => {
    if (err) { return t.fail(err) }
    [1, 2, 3, 4].forEach(n => {
      const fileLength = fs.readFileSync(`${output}/part.${n}.json`).toString().length
      t.equal(fileLength > 0, true, `JSON part ${n} of 4 written`)
    })
    const vrtPath = `${output}/layer.vrt`
    t.ok(fs.statSync(vrtPath), 'VRT written')
    t.equal(fs.readFileSync(vrtPath).toString().length > 0, true, 'VRT has content')
  })
})

test('Teardown', t => {
  Helper.after()
  t.end()
})
