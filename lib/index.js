'use strict'

var listAssets = require('list-assets')
var gutil = require('gulp-util')
var minimatch = require('minimatch')
var Transform = require('stream').Transform

var helpers = require('./helpers')
// const PLUGIN_NAME = 'gulp-resource-hints'

function gulpResourceHints (opt) {
  var options = helpers.mergeOptions(opt)

  var stream = new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
      if (file.isNull()) {
        gutil.log('no file')

        cb(null, file)
        return
      }

      // Gather assets
      var assets = listAssets.html(
        String(file.contents),
        {
          absolute: true,
          protocolRelative: true
        }
      ).map((ob) => {
        return ob.url
      })

      // Build resource hints based on user-selected assets
      var data = ''
      var parsedAssets = [] // for checking duplicates

      for (var i = 0, len = assets.length; i < len; i++) {
        Object.keys(options.paths).forEach((key) => {
          if (minimatch(assets[i], options.paths[key])) {
            data += helpers.buildResourceHint(key, assets[i])
          }
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
