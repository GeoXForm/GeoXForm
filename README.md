# GeoXForm
 *A library for transforming large streams of geojson into csv, kml, shapefile and other formats*

[![npm][npm-img]][npm-url]
[![travis][travis-image]][travis-url]

### Example
- Get GeoJSON from the web -> transform into csv -> write to disk

``` javascript
const GeoXForm = require('geo-xform')
const request = require('request')
const fs = require('fs')
const id = '593b88391b614123890f54a1db8fbf55_0'
request.get(`http://opendata.arcgis.com/datasets/${id}.geojson`)
.pipe(GeoXForm.createStream({format: 'csv', name: 'trees', geometry: 'point'}))
.pipe(fs.createWriteStream('./trees.csv'))
.on('finish', () => console.log('File written to trees.csv'))

```

## Set up
### Install [GDAL](http://www.gdal.org/)
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
### `createStream(format, options)`
Create a stream that takes in geojson of arbitrary size and returns data in the selected format
- Format: the requested output format e.g. csv, zip (shapefile), kml
- Options:
``` javascript
{
      geometry: string // on of ['point', 'line', 'polygon']
      fields: array // the names of fields in a given dataset (csv only)
      name: string // sets the name file parts (shapefile only)
      metadata: string // and xml string to write to file (shapefile only)
      srs: string // the spatial reference system for projecting transformed data (shapefile only)
}
```

### `GeoJSON.createStream(options)`
Create a stream that takes in individual features and returns a feature collection
- Input: A stream of individual GeoJSON features as strings or objects
- Options:
``` javascript
{
    json: boolean // flags whether the input is JSON or string
}
```

### `VRT.createStream(options)`
Create a steam that takes in geojson and outputs an OGR Virtual Layer
- Options:
``` javascript
{
    size: integer // number of features to write into each GeoJSON part, defaults to 5000
    path: string // output path to write the VRT XML and GeoJSON parts
}
```

### `OGR.createStream(format, options)`
Create a stream that takes in a layer and outputs transformed data
- Format: the requested output format e.g. csv, zip (shapefile), kml
- Options:
``` javascript
{
      geometry: string // on of ['point', 'line', 'polygon']
      fields: array // the names of fields in a given dataset (csv only)
      name: string // sets the name file parts (shapefile only)
      metadata: string // and xml string to write to file (shapefile only)
      srs: string // the spatial reference system for projecting transformed data (shapefile only)
}
```

[npm-img]: https://img.shields.io/npm/v/geoxform.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/geoxform
[travis-image]: https://img.shields.io/travis/koopjs/geoxform.svg?style=flat-square
[travis-url]: https://travis-ci.org/koopjs/geoxform
