/* global __dirname */
// const _ = require('highland')
const AdmZip = require('adm-zip')
const fs = require('fs')
const test = require('tape')
const Shapefile = require('../src/lib/shapefile.js')
const Helper = require('./helper')

test('Set up', t => {
  Helper.before()
  t.end()
})

test('Try to create a dataset from a vrt that doesn\'t exist', t => {
  t.plan(1)
  const options = defaultOptions()
  options.name = 'borked'
  const tmp = `${__dirname}/output/${options.name}-tmp.zip`
  options.input = 'foobar!'

  try {
    Shapefile.createReadStream(options)
    .on('error', err => t.ok(err, 'Error handled gracefully'))
    .pipe(fs.createWriteStream(tmp))
  } catch (e) {
    console.trace(e)
    t.fail('Error was uncaught')
  }
})

test('Provide a zip stream of a valid shapefile', t => {
  const options = defaultOptions()
  const output = `${__dirname}/output/${options.name}.zip`
  const tmp = `${__dirname}/output/${options.name}-tmp.zip`

  Shapefile.createReadStream(options)
  .on('error', error => {
    t.fail(error)
    t.end()
  })
  .on('finish', () => console.log('lets make whooopie'))
  .pipe(fs.createWriteStream(tmp))
  .on('finish', () => {
    const parts = getContents(output)
    const names = []
    const sizes = []
    parts.map(part => {
      names.push(part.entryName)
      sizes.push(part.header.size)
    })
    const expectedFiles = ['dummy.shp', 'dummy.dbf', 'dummy.shx', 'dummy.prj', 'dummy.cpg']
    expectedFiles.forEach(file => t.equal(names.indexOf(file) > -1, true, `${file.split('.')[1]} exists in zip`))
    sizes.forEach((size, i) => t.equal(size > 0, true, `${names[i].split('.')[1]} has content`))
    fs.unlinkSync(output)
    fs.unlinkSync(tmp)
    t.end()
  })
})

test('Write metadata into the zip', t => {
  t.plan(1)
  const options = defaultOptions()
  options.metadata = 'Foo!'
  options.name = 'metadata'
  const output = `${__dirname}/output/${options.name}.zip`
  const tmp = `${__dirname}/output/${options.name}-tmp.zip`

  Shapefile.createReadStream(options)
  .on('error', error => {
    t.fail(error)
    t.end()
  })
  .pipe(fs.createWriteStream(tmp))
  .on('finish', () => {
    const names = getContents(output).map(part => { return part.entryName })
    t.equal(names.indexOf('metadata.xml') > -1, true, 'Metadata xml written')
    fs.unlinkSync(output)
    fs.unlinkSync(tmp)
  })
})

test('Teardown', t => {
  Helper.after()
  t.end()
})

function getContents (file) {
  const zip = new AdmZip(file)
  return zip.getEntries()
}

function defaultOptions () {
  return {
    name: 'dummy',
    format: 'zip',
    geometryType: 'Point',
    input: Helper.testVrt,
    path: `${__dirname}/output`
  }
}
