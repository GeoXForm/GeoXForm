'use strict';

var fs = require('fs');
var Geojson = require('./geojson');
var _ = require('highland');

function createStream(options) {
  var size = options.size || 5000;

  var output = _.pipeline(function (stream) {
    var first = true;
    var index = 0;
    return stream.splitBy(',{').map(filter).batch(size).consume(function (err, batch, push, next) {
      if (err) push(err);
      if (first) {
        push(null, '<OGRVRTDataSource>');
        first = false;
        output.emit('properties', sample(batch));
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
  return output;
}

function sample(batch) {
  var sample = batch.find(function (f) {
    var feature = JSON.parse(f);
    if (feature.geometry && feature.geometry.type) return true;else return false;
  });
  sample = JSON.parse(sample || batch[0]);
  var geometry = sample.geometry ? sample.geometry.type : 'NONE';
  var fields = Object.keys(sample.properties);
  return { geometry: geometry, fields: fields };
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

module.exports = { createStream: createStream };