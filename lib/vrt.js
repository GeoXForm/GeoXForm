'use strict';

var fs = require('fs');
var Geojson = require('./geojson');
var _ = require('highland');
var mkdirp = require('mkdirp');

module.exports = {
  create: function create(input, options, callback) {
    var partsCount = 0;
    var size = options.size || 5000;
    mkdirp.sync(options.path);
    var vrtStream = createVrtStream(options.path);
    var partStream = _();
    var stream = _(input);
    stream.splitBy(',{').map(filter).errors(function (err) {
      input.destroy();
      callback(err);
    }).batch(size).tap(function (batch) {
      partsCount++;
      addVrtPart(batch, partsCount, options.path, vrtStream).pipe(partStream);
    }).done(function () {
      // we need a way to know if all the sub-streams have finished
      // there's got. to. be. a better way to do this
      // TODO look at Highland nfcall
      partStream.each(function (partsWritten) {
        if (partsWritten === partsCount) {
          endVrtStream(vrtStream);
          callback(null);
        }
      });
    });
  }
};

function filter(string) {
  var parts = string.split('"features":[{');
  return ('{' + parts[parts.length - 1]).replace(/]}}]}/, ']}');
}

function addVrtPart(batch, index, path, stream) {
  var fileName = path + '/part.' + index + '.json';
  addMetadata(stream, fileName);
  return writeJsonPart(batch, fileName, index);
}

function addMetadata(stream, fileName) {
  stream.write('<OGRVRTLayer name="OGRGeoJSON"><SrcDataSource>' + fileName + '</SrcDataSource></OGRVRTLayer>');
}

function writeJsonPart(batch, fileName, index) {
  var outStream = _();
  var fileStream = fs.createWriteStream(fileName);
  Geojson.createReadStream(_(batch)).pipe(fileStream).on('finish', function () {
    return outStream.write(index);
  });
  return outStream;
}

function createVrtStream(path) {
  var vrtStream = fs.createWriteStream(path + '/layer.vrt');
  vrtStream.write('<OGRVRTDataSource>');
  return vrtStream;
}

function endVrtStream(stream) {
  stream.write('</OGRVRTDataSource>');
  stream.end();
}