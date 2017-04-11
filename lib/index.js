'use strict'

const listAssets = require('list-assets')
const gutil = require('gulp-util')
const Transform = require('stream').Transform

const PLUGIN_NAME = 'gulp-resource-hints'
var helpers = require('./helpers')

function gulpResourceHints (opt) {
  var options = helpers.mergeOptions(opt)

  var stream = new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
      if (file.isNull()) {
        gutil.log(PLUGIN_NAME, 'no file')

        cb(null, file)
        return
      }

      var fileContents = String(file.contents)

      // Gather assets
      var assets = listAssets.html(
        fileContents,
        {
          absolute: true,
          protocolRelative: true
        }
      ).map((ob) => {
        return ob.url
      })

      if (assets.length < 0) {
        cb(null, file)
        return
      }

      helpers.clearParsedAssets()

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
      var data = ''

      for (var i = 0, len = assets.length; i < len; i++) {
        Object.keys(options.paths).forEach((key) => {
          if (options.paths[key] === '') {
            return
          }
          data += helpers.buildResourceHint(key, assets[i], options.paths[key])
        })
      }

      var newFile = helpers.writeData(file, data, options.pageToken)

      if (!newFile) {
        cb(null, file)
        return
      } else {
        file.contents = new Buffer(newFile)
      }

      cb(null, file)
    }
  })

  return stream
}

module.exports = gulpResourceHints
