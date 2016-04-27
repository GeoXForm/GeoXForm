/* @flow */
'use strict'
/**
 * Gets a set of OGR Parameters for an export
 *
 * @param {object} options - potentially contains a fields object
 */
function create (format, options) {
  const ogrFormat = ogrFormats[format]
  // shapefiles cannot be streamed out of ogr2ogr
  const output = format === 'zip' ? `${options.path || '.'}/${options.name}` : '/vsistdout/'
  const input = options.input || 'layer.vrt'

  let cmd = ['--config', 'SHAPE_ENCODING', 'UTF-8', '-f', ogrFormat, output, input]

  options.geometry = options.geometry && options.geometry.toUpperCase() || 'NONE'
  if (format === 'csv') cmd = csvParams(cmd, options)
  if (format === 'zip') cmd = shapefileParams(cmd, options)
  return finishOgrParams(cmd)
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
  cmd.push('-lco', 'WRITE_BOM=YES')
  const hasPointGeom = options.geometry === 'POINT'
  const fields = options.fields.join('|').toLowerCase().split('|')
  const hasXY = fields.indexOf('x') > -1 && fields.indexOf('y') > -1
  if (hasPointGeom && !hasXY) cmd = cmd.concat(['-lco', 'GEOMETRY=AS_XY'])
  return cmd
}

/**
 * Add parameters specific to a csv export
 *
 * @param {string} cmd - an array of OGR command parts to modify
 * @param {object} options - may contain a wkid or srs
 * @param {function} callback - calls back back with a modified command array or an error
 * @private
 */
function shapefileParams (cmd, options) {
  // make sure geometries are still written even if the first is null
  if (options.geometry !== 'NONE') cmd.push('-nlt', options.geometry.toUpperCase())
  cmd.push('-fieldmap', 'identity')
  if (!options.ignoreShpLimit) cmd.push('-lco', '2GB_LIMIT=yes')
  if (options.srs) cmd.push('-t_srs', options.srs)
  return cmd
}

/**
 * Adds final parameters to the OGR function call
 * @param {array} cmd - an array of OGR command parts to modify
 * @return {string} the final OGR command
 */
function finishOgrParams (cmd) {
  cmd.push('-append')
  cmd.push('-skipfailures')
  cmd.push('-lco', 'ENCODING=UTF-8')
  return cmd
}

const ogrFormats = {
  kml: 'KML',
  zip: 'ESRI Shapefile',
  csv: 'CSV',
  json: 'GeoJSON',
  geojson: 'GeoJSON',
  gpkg: 'GPKG'
}

module.exports = {create}
