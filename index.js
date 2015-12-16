'use strict';

var VRT = require('./lib/vrt');
var OGR = require('./lib/ogr');
var _ = require('highland');

function createStream(format, options) {
  var stream = _.pipeline(function (stream) {
    return stream.pipe(VRT.createStream(options)).on('log', function (l) {
      return stream.emit('log', l);
    }).on('error', function (e) {
      return stream.emit('error', e);
    }).pipe(OGR.createStream(format, options)).on('log', function (l) {
      return stream.emit('log', l);
    }).on('error', function (e) {
      return stream.emit('error', e);
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