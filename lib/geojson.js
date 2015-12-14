'use strict';

var _ = require('highland');

module.exports = {
  createReadStream: function createReadStream(input, options) {
    var start = '{"type":"FeatureCollection","features":[';
    var end = ']}';
    var features = options && options.json ? _(input).compact().map(JSON.stringify) : _(input).compact();
    var readStream = _([start]).concat(features.intersperse(',')).append(end);

    return readStream;
  }
};