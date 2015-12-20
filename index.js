'use strict';

var VRT = require('./lib/vrt');
var OGR = require('./lib/ogr');
var random = require('randomstring');
var rimraf = require('rimraf');
var _ = require('highland');
var mkdirp = require('mkdirp');

function createStream(format, options) {
  options = options || {};
  options.path = (options.path || '.') + '/' + random.generate();
  mkdirp.sync(options.path);
  var stream = _.pipeline(function (stream) {
    var ogrStream = OGR.createStream(format, options);
    return stream.pipe(VRT.createStream(options)).on('log', function (l) {
      return stream.emit('log', l);
    }).on('error', function (e) {
      return stream.emit('error', e);
    }).on('properties', function (p) {
      return ogrStream.emit('properties', p);
    }).pipe(ogrStream).on('log', function (l) {
      return stream.emit('log', l);
    }).on('error', function (e) {
      return stream.emit('error', e);
    }).on('end', function (e) {
      return rimraf(options.path, function (err) {
        if (err) stream.emit('log', { level: 'error', message: 'Failed to delete temporary directory' });
      });
    });
  });
  return stream;
}

module.exports = {
  GeoJSON: require('./lib/geojson'),
  OGR: OGR,
  VRT: VRT,
  createStream: createStream
};