# Koop-Exporter
 *A library for transforming large streams of geojson into csv, kml, shapefile and other formats*

[![npm][npm-img]][npm-url]
[![travis][travis-image]][travis-url]

## Set up
### Install GDAL
- With Homebrew on OSX: `brew install gdal`
- On Ubuntu: `sudo apt-get install gdal-bin`

### Install node dependencies
- `(sudo) npm install`

## Development
### Install Babel
- `(sudo) npm install -g babel`

### Transpile to ES5
- `npm build`

### Test
- `npm test`

## API
### `GeoJSON.createReadStream(input, options)`
Return a stream of a GeoJSON feature collection from a stream of individual GeoJSON features
- Input: A stream of individual GeoJSON features as strings or objects
- Options:
``` javascript
{
    json: boolean // flags whether the input is JSON or string
}
```

### `VRT.create(input, options, callback)`
Asynchronously create an OGR virtual layer from a stream of GeoJSON
- Input: A GeoJSON Feature Collection consumable as a readable stream
- Options:
``` javascript
{
    size: integer // number of features to write into each GeoJSON part, defaults to 5000
    path: string // output path to write the VRT XML and GeoJSON parts
}
```

### `OGR.createReadStream(input, options)`
Return a stream of data transformed by OGR
- Input: Path to a file or virtual layer to be transformed by OGR
- Options:
``` javascript
{
      format: string // one of ['csv', 'zip', 'kml']
      geometryType: string // on of ['point', 'line', 'polygon']
      fields: array // the names of fields in a given dataset (csv only)
      name: string // sets the name file parts (shapefile only)
      metadata: string // and xml string to write to file (shapefile only)
      srs: string // the spatial reference system for projecting transformed data (shapefile only)
}
```

[npm-img]: https://img.shields.io/npm/v/koop-exporter.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koop-exporter
[travis-image]: https://img.shields.io/travis/koopjs/koop-exporter.svg?style=flat-square
[travis-url]: https://travis-ci.org/koopjs/koop-exporter
