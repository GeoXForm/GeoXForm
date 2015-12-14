const spawn = require('child_process').spawn
const _ = require('highland')
const sanitize = require('sanitize-filename')

const ogrFormats = {
  kml: 'KML',
  zip: '"ESRI Shapefile"',
  csv: 'CSV',
  json: 'GeoJSON',
  geojson: 'GeoJSON',
  gpkg: 'GPKG'
}

module.exports = {
  createReadStream: function (input, options) {
    const readStream = _()
    options.name = sanitize(options.name)
    options.input = input
    const cmd = this.createCmd(options)

    if (options.format === 'zip') return require('./shapefile').createReadStream(options)

    const ogr = spawn('ogr2ogr', cmd)
    ogr.stdout.on('data', data => readStream.write(data))
    ogr.on('close', c => {
      if (c > 0) readStream.emit('error', new Error('OGR Failed'))
      else readStream.end()
    })

    return readStream
  },
  /**
   * Gets a set of OGR Parameters for an export
   *  
   * @param {object} options - potentially contains a fields object
   */
  createCmd: function (options) {
    const ogrFormat = ogrFormats[options.format]
    // shapefiles cannot be streamed out of ogr2ogr
    const output = options.format === 'zip' ? `${options.path || '.'}/${options.name}` : '/vsistdout/'
    const input = options.input || 'layer.vrt'

    let cmd = ['--config', 'SHAPE_ENCODING', 'UTF-8', '-f', ogrFormat, output, input]

    options.geometryType = options.geometryType && options.geometryType.toUpperCase() || 'NONE'
    if (options.format === 'csv') cmd = csvParams(cmd, options)
    if (options.format === 'zip') cmd = shapefileParams(cmd, options)
    return finishOgrParams(cmd)
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
  cmd.push('-lco')
  cmd.push('WRITE_BOM=YES')
  const hasPointGeom = options.geometryType === 'POINT'
  const fields = options.fields.join('|').toLowerCase().split('|')
  const hasXY = fields.indexOf('x') > -1 && fields.indexOf('y') > -1
  if (hasPointGeom && !hasXY) cmd = cmd.concat(['-lco', 'GEOMETRY=AS_XY'])
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
function shapefileParams (cmd, options) {
  // make sure geometries are still written even if the first is null
  cmd.push(`-nlt ${options.geometryType.toUpperCase()}`)
  cmd.push('-fieldmap')
  cmd.push('identity')
  if (options.wkt) cmd.push(`-t_srs '${options.wkt}'`)
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
  cmd.push('-lco')
  cmd.push('ENCODING=UTF-8')
  return cmd
}
