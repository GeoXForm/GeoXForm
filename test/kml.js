const test = require('tape')
const Ogr = require('../src/lib/ogr.js')
const Helper = require('./helper')
const _ = require('highland')

test('Set up', t => {
  Helper.before()
  t.end()
})

test('Create a kml readstream', t => {
  t.plan(1)
  const options = defaultOptions()
  const rows = []
  Helper.vrt()
  .pipe(Ogr.createStream('kml', options))
  .on('error', e => {console.log(e); t.end(e)})
  .splitBy('<Placemark>')
  .compact()
  .each(row => {
    rows.push(row)
    })
  .done(() => {
    t.equal(rows.length, 101, 'All rows written to the stream')
   })
})

test('Gracefully handle a malformed VRT', t => {
  t.plan(1)
  const options = defaultOptions()
  try {
    _(['Foobar!'])
    .pipe(Ogr.createStream('kml', options))
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
    path: `${__dirname}/output`,
    name: 'dummy',
    geometry: 'Point'
  }
}
