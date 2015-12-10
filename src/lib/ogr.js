const SR = require('spatialreference')
// TODO figure out how to pass in the DB?
const sr = new SR({})
const formatSpatialRef = require('format-spatial-ref')
const exec = require('child_process').exec

module.exports = {
  execute: function (options, callback) {
    this.getCommand(options, (err, cmd) => {
      if (err) return callback(err)
      console.log(cmd.join(' '))
      exec(cmd.join(' '), (err, stdout, stderr) => {
        if (err) return callback(err)
        callback(null, `${options.path}/${options.name}`)
      })
    })
  },
  /**
   * Gets a set of OGR Parameters for an export

   * @param {string} format - the output format
   * @param {string} inFile - the geojson or vrt to use as a source
   * @param {string} outFile - the file to write
   * @param {object} geojson - a geojson object used in the xform
   * @param {object} options - potentially contains a fields object
   */
  getCommand: function (options, callback) {
    const ogrFormat = ogrFormats[options.format]
    // shapefiles cannot be streamed out of ogr2ogr
    const name = options.name // TODO cleanse the name to make it safe
    const output = options.format === 'zip' ? `${options.path || '.'}/${name}` : '/vsistdout/'
    const input = options.input || 'layer.vrt'

    let cmd = ['ogr2ogr', '--config', 'SHAPE_ENCODING', 'UTF-8', '-f', ogrFormat, output, input]

    options.geometryType = options.geometryType && options.geometryType.toUpperCase() || 'NONE'
    if (options.format !== 'zip') {
      if (options.format === 'csv') cmd = csvParams(cmd, options)
      callback(null, finishOgrParams(cmd))
    } else {
      shapefileParams(cmd, options, function (err, cmd) {
        if (err) return callback(err)
        callback(null, finishOgrParams(cmd))
      })
    }
  }
}

/**
 * Add parameters specific to a csv export
 *
 * @param {array} cmd - an array of OGR command parts to modify
 * @param {object} options - may contain fields
 * @return {array}
 * @private
 */
function csvParams (cmd, options) {
  cmd.push('-lco WRITE_BOM=YES')
  const hasPointGeom = options.geometryType === 'POINT'
  const fields = options.fields.join('|').toLowerCase().split('|')
  const hasXY = fields.indexOf('x') > -1 && fields.indexOf('y') > -1
  if (hasPointGeom && !hasXY) {
    cmd.push('-lco GEOMETRY=AS_XY')
  }
  return cmd
}

/**
 * Add parameters specific to a csv export
 *
 * @param {string} cmd - an array of OGR command parts to modify
 * @param {object} options - may contain a wkid or wkt
 * @param {function} callback - calls back back with a modified command array or an error
 * @private
 */
function shapefileParams (cmd, options, callback) {
  // make sure geometries are still written even if the first is null
  cmd.push('-nlt ' + options.geometryType.toUpperCase())
  if (options.outSr) options.sr = formatSpatialRef(options.outSr)
  if (options.sr || options.wkid) {
    addProjection(options, function (err, wkt) {
      if (err) return callback(err)
      cmd.push("-t_srs '" + wkt + "'")
      // make sure field names are not truncated multiple times
      cmd.push('-fieldmap identity')
      callback(null, cmd)
    })
  } else {
    cmd.push('-fieldmap identity')
    callback(null, cmd)
  }
}

/**
 * Adds final parameters to the OGR function call
 * @param {array} cmd - an array of OGR command parts to modify
 * @return {string} the final OGR command
 */
function finishOgrParams (cmd) {
  cmd.push('-append')
  cmd.push('-skipfailures')
  cmd.push('-lco')
  cmd.push('ENCODING=UTF-8')
  return cmd
}

/**
 * Gets projection information for a shapefile exprot
 * @param {object} options - contains info on spatial reference, wkid and wkt
 * @param {function} callback - calls back with an error or wkt
 * @private
 */
function addProjection (options, callback) {
  // if there is a passed in WKT just use that
  if (!options.sr) options.sr = {}
  if (options.sr.wkt) return callback(null, options.sr.wkt)
  const wkid = options.sr.latestWkid || options.sr.wkid || options.wkid
  sr.wkidToWkt(wkid, function (err, wkt) {
    callback(err, wkt, wkid)
  })
}

const ogrFormats = {
  kml: 'KML',
  zip: '"ESRI Shapefile"',
  csv: 'CSV',
  json: 'GeoJSON',
  geojson: 'GeoJSON',
  gpkg: 'GPKG'
}
