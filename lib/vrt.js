'use strict';

var fs = require('fs');
var Geojson = require('./geojson');
var _ = require('highland');
var mkdirp = require('mkdirp');

function createStream(options) {
  var size = options.size || 5000;
  mkdirp.sync(options.path);

  return _.pipeline(function (stream) {
    var first = true;
    var index = 0;
    return stream.splitBy(',{').map(filter).batch(size).consume(function (err, batch, push, next) {
      if (first) {
        push(null, '<OGRVRTDataSource>');
        first = false;
      }
      if (batch === _.nil || batch === '{}') {
        push(null, '</OGRVRTDataSource>');
        return push(null, _.nil);
      }
      var fileName = options.path + '/part.' + index + '.json';
      writeJsonPart(batch, fileName, index).on('finish', function () {
        push(null, addMetadata(fileName));
        index++;
        next();
      });
    });
  });
}

function filter(string) {
  var parts = string.split('"features":[{');
  return ('{' + parts[parts.length - 1]).replace(/]}}]}/, ']}}');
}

function addMetadata(fileName) {
  return '<OGRVRTLayer name="OGRGeoJSON"><SrcDataSource>' + fileName + '</SrcDataSource></OGRVRTLayer>';
}

function writeJsonPart(batch, fileName) {
  var fileStream = fs.createWriteStream(fileName);
  return _(batch).pipe(Geojson.createStream()).pipe(fileStream);
}

function createVrtStream(path) {
  var vrtStream = fs.createWriteStream(path + '/layer.vrt');
  vrtStream.write();
  return vrtStream;
}

function endVrtStream(stream) {
  stream.write();
}

module.exports = { createStream: createStream };