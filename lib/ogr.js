'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var spawn = require('child_process').spawn;
var _ = require('highland');
var sanitize = require('sanitize-filename');
var fs = require('fs');
var Shapefile = require('./shapefile');
var Cmd = require('./ogr-cmd');

function createStream(format, options) {
  options.input = options.path + '/layer.vrt';
  var vrt = fs.createWriteStream(options.input);
  var output = _.pipeline(function (stream) {
    var temp = _();
    stream.pipe(vrt).on('finish', function () {
      options.name = options.name ? sanitize(options.name) : 'output';
      var cmd = Cmd.create(format, options);
      if (format === 'zip') return Shapefile.createStream(options);
      var ogr = spawn('ogr2ogr', cmd);
      // TODO can I just pipe out vs writing to temp?
      ogr.stdout.on('data', function (data) {
        return temp.write(data);
      });
      ogr.stderr.on('data', function (data) {
        return output.emit('log', { level: 'debug', message: data.toString() });
      });
      ogr.on('close', function (c) {
        output.emit('log', { level: 'info', message: 'Executing: OGR2OGR ' + cmd.join(' ') });
        if (c > 0) output.emit('error', new Error('OGR Failed'));else temp.end();
      });
    });
    return temp;
  }).on('properties', function (p) {
    return _extends(options, p);
  });

  return output;
}

module.exports = { createStream: createStream };