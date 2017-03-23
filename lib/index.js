'use strict'

// var gutil = require('gulp-util')
var listAssets = require('list-assets')
var through = require('through2')
var glob = require('glob')

var defaults = {
  prefetch: '**/*.+(png|svg|woff|woff2)'
}

module.exports = function (opt) {
  opt = typeof opt === 'object' ? opt : {}
  var options = Object.assign(defaults, opt)

  return through.obj(function (file, enc, cb) {
    if (file.isNull() || enc !== 'buffer') {
      cb(null, file)
      return
    }

    // var resourceHints = ''
    var assets = listAssets.html(String(file.contents)).map((ob) => {
      return ob.url
    })

    Object.keys(options).forEach((key) => {
      for (let i = 0, len = assets.length; i < len; i++) {
        glob(options[key], (er, fileURL) => {
          console.log('File found!', fileURL)
        })
      }
    })
  })
}
