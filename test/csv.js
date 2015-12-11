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
  const rows = []
  Ogr.createReadStream(options)
  .on('error', e => {console.log(e); t.end(e)})  
  .split()
  .compact()
  .each(row => {
    rows.push(row)
    })
  .done(() => {
    t.equal(rows.length, 101, 'All rows written to the stream')
   })
})

test('Gracefully handle a vrt that does not exist', t => {
  t.plan(1)
  const options = defaultOptions()
  options.input = 'foobar!'
  try {
    Ogr.createReadStream(options)
    .on('error', err => {
      t.ok(err, 'Error was caught in the correct place')
      t.end()
     })
    .done(() => t.end())
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
    name: 'dummy',
    format: 'csv',
    geometryType: 'Point',
    input: Helper.testVrt,
    fields: ['foo', 'bar', 'baz']
  }
}
