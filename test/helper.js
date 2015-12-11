const fs = require('fs')
const rimraf = require('rimraf')
const outputDir = `${__dirname}/output`
const testVrt = `${__dirname}/fixtures/layer2.vrt`

module.exports = {
  before: function () {
    try {
      fs.mkdirSync(outputDir)
    } catch (e) {
      console.log('Output folder already exists')
    }
    const vrt = fs.readFileSync(`${__dirname}/fixtures/layer.vrt`).toString()
    // layers in the VRT must reference direct paths
    const localVrt = vrt.replace(/dummy/g, `${__dirname}/fixtures`)
    fs.writeFileSync(testVrt, localVrt)
  },

  after: function () {
    try {
      fs.unlinkSync(testVrt)
    } catch (e) {
      console.error('New layer fixture did not exist')
    }
    rimraf.sync(outputDir)
  },
  testVrt: `${__dirname}/fixtures/layer2.vrt`
}
