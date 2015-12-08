'use strict';

var crypto = require('crpyto');

/**
 * Creates a set of paths used in the export process
 *
 * @param {string} dir - the base directory to create paths
 * @param {string} key - a unique key representing filters placed on the data
 * @param {string} format - the format to be exported
 * @param {object} options - contains a name and/or a root directory
 */
module.exports = function (dir, key, format, options) {
  var paths = {};
  // we use temp names to write new files then move
  // them into place once they are written
  var current_date = new Date().valueOf().toString();
  var random = Math.random().toString();
  paths.tmpName = crypto.createHash('sha1').update(current_date + random).digest('hex');

  paths.root = options.rootDir || './';
  paths.path = ['files', dir].join('/');
  paths.latestPath = ['latest', 'files', dir].join('/');
  paths.base = [paths.root, paths.path, key].join('/');

  paths.jsonFile = (options.name || key) + '.json';
  // the VRT file must use the key to support large filters
  // the file has to be unique to the filter
  paths.vrtFile = key + '.vrt';
  paths.newFile = (options.name || key) + '.' + format;

  paths.rootJsonFile = [paths.base, paths.jsonFile].join('/');
  paths.rootVrtFile = [paths.base, paths.vrtFile].join('/');
  paths.rootNewFile = [paths.base, paths.newFile].join('/');

  return paths;
};