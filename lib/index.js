'use strict'

// var gutil = require('gulp-util')
var listAssets = require('list-assets')
var glob = require('glob')
var Transform = require('stream').Transform

var defaults = {
  prefetch: '**/*.+(png|svg|woff|woff2)'
}

function insertResourceHints (options, file) {
  // var resourceHints = ''
  var assets = listAssets.html(String(file.contents)).map((ob) => {
    return ob.url
  })

  console.log('Assets are', assets)

  Object.keys(options).forEach((key) => {
    for (let i = 0, len = assets.length; i < len; i++) {
      glob(options[key], (er, fileURL) => {
        console.log('File found!', fileURL)
      })
    }
  })
}

module.exports = function (opt) {
  opt = typeof opt === 'object' ? opt : {}
  var options = Object.assign(defaults, opt)

  console.log('we made it to the function;')

  return new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
      console.log('inside the transform')

      if (file.isNull() || enc !== 'buffer') {
        console.log('not a buffer')
        cb(null, file)
        return
      }

      insertResourceHints(options, file)

      cb(null, file)
    }
  })
}
