'use strict'
const test = require('tape')
const Ogr = require('../src/lib/ogr.js')
const Helper = require('./helper')

test('Set up', t => {
  Helper.before()
  t.end()
})

test('Create a csv readstream', t => {
  t.plan(1)
  const options = defaultOptions()
  let rows = 0
  Ogr.createStream('csv', options)
  .on('error', e => {
    console.log(e); t.end(e)
  })
  .split()
  .compact()
  .each(row => rows++)
  .done(() => {
    t.equal(rows, 101, 'All rows written to the stream')
  })
})

test('Gracefully handle a malformed VRT', t => {
  t.plan(1)
  const options = defaultOptions()
  options.input = Helper.malformedVrt
  try {
    Ogr.createStream('csv', options)
    .on('error', err => {
      t.ok(err, 'Error was caught in the correct place')
      t.end()
    })
    .on('finish', () => t.end())
  } catch (e) {
    t.fail('Error was uncaught')
  }
})

test('Teardown', t => {
  Helper.after()
  t.end()
})

function defaultOptions () {
  return {
    path: `${__dirname}/output`,
    name: 'dummy',
    geometry: 'Point',
    fields: ['foo', 'bar', 'baz'],
    input: Helper.testPath
  }
}
