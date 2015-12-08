'use strict';

var _ = require('highland');
var files = require('koop').files;

function geojson(cache, table, options) {
  var featureStream = cache.createExportStream(table, options);
  var uploadStream = files.createWriteStream(options.path);
  return write(featureStream, uploadStream);
}

function write(input, output) {
  var start = '{"type":"FeatureCollection","features":["';
  var end = ']}';

  return _([start]).concat(input).intersperse(',').append(end).pipe(output);
}

module.exports = {
  geojson: geojson,
  write: write
};