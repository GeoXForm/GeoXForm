'use strict';

var _ = require('highland');
var fs = require('fs');
var path = require('path');
var Ogr = require('./ogr');
var exec = require('child_process').exec;

module.exports = {
  createReadStream: function createReadStream(options) {
    var readStream = _();
    var cmd = 'ogr2ogr ' + Ogr.createCmd(options).join(' ');

    exec(cmd, function (err) {
      if (err) return readStream.emit('error', new Error('Call to OGR failed'));
      var folder = options.path + '/' + options.name;
      if (options.metadata) fs.writeFileSync(folder + '/' + options.name + '.xml', options.metadata);
      createZipStream(folder).on('error', function (e) {
        return readStream.emit('error', e);
      }).pipe(readStream);
    });
    return readStream;
  }
};

function createZipStream(input) {
  var zipStream = _();
  var cmd = ['zip', '-rj', '"' + input + '.zip"', '"' + input + '"', '--exclude=*.json*', '--exclude=*.vrt'];
  renameFiles(input);
  exec(cmd.join(' '), function (err, stdout, stderr) {
    if (err) return zipStream.emit('error', new Error('Failed while zipping'));
    fs.createReadStream(input + '.zip').pipe(zipStream);
  });
  return zipStream;
}

function renameFiles(input) {
  fs.readdirSync(input).forEach(function (file) {
    var oldName = path.join(input, file);
    var newName = oldName.replace(/ogrgeojson/i, path.basename(input));
    fs.renameSync(oldName, newName);
  });
}