'use strict'

const listAssets = require('list-assets')
const Transform = require('stream').Transform

const PLUGIN_NAME = 'gulp-resource-hints'
var helpers = require('./helpers')

/**
 * Main Function
 * Read file streams, parse assets, build resource hints
 * @param {object} opt
 */
function gulpResourceHints (opt) {
  var options = helpers.options(opt)
  helpers.reset()

  return new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
      if (file.isNull()) {
        helpers.logger(PLUGIN_NAME, 'no file', true)

        cb(null, file)
        return
      }

      var fileContents = String(file.contents)

      // Gather assets, keep unique values
      // Using https://www.npmjs.com/package/list-assets
      var assets = new Set(listAssets.html(
        fileContents,
        {
          absolute: true,
          protocolRelative: true
        }
      ).map(ob => ob.url))

      if (assets.size < 0) {
        // Skip file: no static assets
        cb(null, file)
        return
      }

      if (!helpers.hasInsertionPoint(file)) {
        helpers.logger(PLUGIN_NAME, 'Skipping file: no <head> or token found', true)
        cb(null, file)
        return
      }

      // Future feature! Gotta do more stream madness
      // if (options.getCSSAssets) {
      //   for (var k = 0, cssLen = assets.length; k < cssLen; k++) {
      //     if (assets[k].endsWith('.css') || assets[k].endsWith('.CSS')) {
      //       assets.push(listAssets.css(
      //         fileContents
      //       ))
      //     }
      //   }
      // }

      // Build resource hints based on user-selected assets
      var data = ['']

      assets.forEach((aVal, aKey, set) => {
        Object.keys(options.paths).forEach((key) => {
          if (options.paths[key] === '') {
            return
          }
          data.push(helpers.buildResourceHint(key, aVal, options.paths[key]))
        })
      })

      data = data.reduce((a, b) => a + b)
      var newFile = helpers.writeDataToFile(file, data, options.pageToken)

      if (!newFile) {
        helpers.logger(PLUGIN_NAME + ': Could not write data to file. ' + file.relative)
        cb(null, file)
        return
      } else {
        file.contents = new Buffer(newFile)
      }

      cb(null, file)
    }
  })
}

module.exports = gulpResourceHints
