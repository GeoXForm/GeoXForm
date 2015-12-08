const _ = require('highland')
const Vrt = require('../src/lib/vrt')
const test = require('tape')
const fs = require('fs')
const rimraf = require('rimraf')
const JsonStream = require('jsonstream')

const output = `${__dirname}/output`

test('before', function (t) {
  try {
    fs.mkdirSync(output)
  } catch (e) {
    console.log('Output folder already exists')
  }
  t.end()
})

test('write a vrt', function (t) {
  t.plan(4)
  const fixture = fs.createReadStream(`${__dirname}/fixtures/fc.geojson`)
  const stream = _(fixture).pipe(JsonStream.parse('features.*')).pipe(_()).map(JSON.stringify)
  Vrt.write(stream, output, {size: 33})
  .errors(function (error) {
    t.fail(error)
  })
  .done(function () {
    try {
      [1, 2, 3, 4].forEach((n) => t.ok(fs.statSync(`${output}/part.${n}.json`), `JSON part ${n} of 4 exists`))
    } catch (e) {
      t.fail(e)
    }
  })
})

test('after', function (t) {
  rimraf.sync(output)
  t.end()
})
