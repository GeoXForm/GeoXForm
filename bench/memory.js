var GeoXForm = require('../index')
var fs = require('fs')
var csv = require('csv-write-stream')

function xform (i) {
  if (i < 1) process.exit(0)
  fs.createReadStream('./trees.geojson')
  .pipe(GeoXForm.createStream('zip', {name: 'test'}))
  .pipe(fs.createWriteStream('./trees.zip'))
  .on('finish', function () {
    console.log('run finished')
    i--
    xform()
  })
}

var offset = 0
var writer = csv({ headers: ['timestamp', 'rss', 'heapTotal', 'heapUsed'] })
writer.pipe(fs.createWriteStream('./memory-usage-' + process.pid + '.csv'))

setInterval(function () {
  offset++
  var mem = process.memoryUsage()
  mem.timestamp = Date.parse(new Date()) / 1000
  var stats = [offset, mem.rss, mem.heapTotal, mem.heapUsed]
  console.log(stats)
  writer.write(stats)
}, 1000)

process.on('exit', function () {
  // close the stream
  writer.end()
})

console.log('YEEEEHAWWWWW')
xform(1000)
