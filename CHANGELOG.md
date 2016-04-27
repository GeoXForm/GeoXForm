# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.3] - 2016-04-27
### Changed
* Don't specify `NLT NONE`
* Catch error in featureParser

## [1.2.2] - 2016-04-23
### Fixed
* Eliminated file descriptor leak

## [1.2.1] - 2016-04-22
### Changed
* Be less verbose with logging debug messages

## [1.2.0] - 2016-04-22
### Added
* `stream.abort()` will kill ogr and cleanup temp files

### Fixed
* Listen to exit and error events on the `ogr` child process

## [1.1.5] - 2016-04-18
### Fixed
* Catch messages coming off ogr stderr

## [1.1.4] - 2016-04-15
### Changed
* Respect 2GB shapefile dbf limit unless `options.ignoreShpLimit === true`

### Fixed
* Clean up failure handling on shapefiles

## [1.1.3] - 2016-03-30
### Fixed
* Removed potential sigterm listener leak

## [1.1.2] - 2016-03-24
### Fixed
* Shapefile SRS transformations complete successfully

## [1.1.1] - 2016-03-20
### Changed
* Remove unused package

## [1.1.0] - 2016-03-17
### Added
* SIGTERM will cause OGR and ZIP to exit

### Changed
* Shapefile will fail when OGR emits errors

## [1.0.15] - 2016-02-01
### Changed
* Extract geojson feature parsing into [Feature Parser](https://github.com/dmfenton/feature-parser)
* Use Highland 3.0 branch for more performant pipelines

## [1.0.14] - 2016-01-28
### Fixed
* Rebuild

## [1.0.13] - 2016-01-28
### Fixed
* JSON parsing is much less fragile

## [1.0.12] - 2016-01-27
### Changed
* Change name of path option

## [1.0.11] - 2016-01-26
### Fixed
* Rebuild

## [1.0.10] - 2016-01-26
### Changed
* Refactor VRT internals

## [1.0.9] - 2016-01-23
### Fixed
* Better fix for `lib/vrt` race condition

## [1.0.8] - 2016-01-21
### Fixed
* Handle case where first geojson feature does not have featureCollection tag
* Handle edge cases where geojson has spaces in the tags

## [1.0.7] - 2016-01-12
### Changed
* `GeoXForm.createStream` will emit an error when OGR does

## [1.0.6] - 2016-01-10
### Fixed
* Add missing package

## [1.0.5] - 2016-01-10
### Changed
* Use Lodash find instead of Array.find

## [1.0.4] - 2016-01-10
### Fixed
* Fixed race condition in `lib/vrt`

## [1.0.3] - 2016-01-08
### Changed
* Clean up after failure cases
### Fixed
* Fail gracefully with bad geojson while creating a vrt

## [1.0.2] - 2016-01-02
### Fixed
* Shapefile stream works correctly when called from `GeoXForm.createStream`

## [1.0.1] - 2015-12-20
### Changed
* Clean up temporary files after finishing a convert stream
* No need to specify fields or geometry when using top-level createStream API

## [1.0.0] - 2015-12-16
### Added
* New top level method `createStream` takes in a geojson stream and returns a stream of the object transformed by OGR2OGR
### Changed
* Changed project name to GeoXForm
* Renamed each exported method to `createStream`
* Methods return transform streams instead accepting input  as a parameter and returning a readable stream

## [0.0.2] - 2015-12-14
### Changed
* Removed extraneous files related to jobs

## [0.0.1] - 2015-12-14
### Added
* Initial release: API supports creating VRTs, Geojson, shapefile, kml and csv

[Unreleased]: https://github.com/koopjs/geoxform/compare/v1.2.2...HEAD
[1.2.3]: https://github.com/koopjs/geoxform/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/koopjs/geoxform/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/koopjs/geoxform/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/koopjs/geoxform/compare/v1.1.5...v1.2.0
[1.1.5]: https://github.com/koopjs/geoxform/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/koopjs/geoxform/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/koopjs/geoxform/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/koopjs/geoxform/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/koopjs/geoxform/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/koopjs/geoxform/compare/v1.0.15...v1.1.0
[1.0.15]: https://github.com/koopjs/geoxform/compare/v1.0.14...v1.0.15
[1.0.14]: https://github.com/koopjs/geoxform/compare/v1.0.13...v1.0.14
[1.0.13]: https://github.com/koopjs/geoxform/compare/v1.0.12...v1.0.13
[1.0.12]: https://github.com/koopjs/geoxform/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/koopjs/geoxform/compare/v1.0.10...v1.0.11
[1.0.10]: https://github.com/koopjs/geoxform/compare/v1.0.9...v1.0.10
[1.0.9]: https://github.com/koopjs/geoxform/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/koopjs/geoxform/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/koopjs/geoxform/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/koopjs/geoxform/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/koopjs/geoxform/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/koopjs/geoxform/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/koopjs/geoxform/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/koopjs/geoxform/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/koopjs/geoxform/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/koopjs/geoxform/compare/v0.0.2...v1.0.0
[0.0.2]: https://github.com/koopjs/geoxform/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/koopjs/geoxform/releases/tag/v0.0.1
