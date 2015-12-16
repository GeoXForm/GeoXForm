'use strict';

var VRT = require('./vrt');
var OGR = require('./ogr');
var _ = require('highland');

module.exports = function (options) {
  return _.pipeline(function (s) {
    var output = _();
    return s.pipe(VRT.createStream(options)).on('log', function (l) {
      return output.emit('log', l);
    }).on('error', function (e) {
      return output.emit('error', e);
    }).collect().map(function (vrt) {
      return vrt.join('');
    }).pipe(OGR.createStream(options)).on('log', function (l) {
      return output.emit('log', l);
    }).on('error', function (e) {
      return output.emit('error', e);
    }).pipe(output);
  });
};