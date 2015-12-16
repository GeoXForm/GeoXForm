'use strict';

var _ = require('highland');

function createStream(options) {
  var start = '{"type":"FeatureCollection","features":[';
  var end = ']}';
  var readStream = _.pipeline(function (s) {
    var features = options && options.json ? _(s).compact().map(JSON.stringify) : _(s).compact();
    return _([start]).concat(features.intersperse(',')).append(end);
  });
  return readStream;
}

module.exports = { createStream: createStream };