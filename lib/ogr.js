'use strict';

var spawn = require('child_process').spawn;
var _ = require('highland');
var sanitize = require('sanitize-filename');
var fs = require('fs');
var Shapefile = require('./shapefile');
var Cmd = require('./ogr-cmd');

function createStream(format, options) {
  options.input = options.path + '/layer.vrt';
  var vrt = fs.createWriteStream(options.input);
  options.name = options.name ? sanitize(options.name) : 'output';

  var cmd = Cmd.create(format, options);

  var output = _.pipeline(function (stream) {
    var temp = _();
    stream.pipe(vrt).on('finish', function () {
      if (format === 'zip') return shapefile.createStream(options);
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
  });
  return output;
}

module.exports = { createStream: createStream };