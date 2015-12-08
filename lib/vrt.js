'use strict';

// take in a stream of geojson and produce a vrt
var fs = require('fs');
var Geojson = require('./geojson');
var _ = require('highland');

function write(stream, path, options) {
  var n = 0;
  var size = options.size || 5000;
  var returned = _();
  stream.batch(size).tap(function (batch) {
    n++;
    var fileStream = fs.createWriteStream(path + '/part.' + n + '.json');
    return Geojson.write(_(batch), fileStream);
  }).errors(function (error) {
    returned.emit('error', error);
    stream.destroy();
  }).done(function () {
    returned.end();
  });

  return returned;
}

module.exports = {
  write: write
};