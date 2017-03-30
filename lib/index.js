'use strict'

var listAssets = require('list-assets')
var isCSS = require('is-css')
var gutil = require('gulp-util')
var minimatch = require('minimatch')
var Transform = require('stream').Transform

// const PLUGIN_NAME = 'gulp-resource-hints'

var defaults = {
  pageToken: '##gulp-resource-hints##',
  paths: {
    prefetch: '**/*.+(png|svg|jpg|jpeg|gif|woff|woff2)',
    preload: '',
    preconnect: '',
    'dns-prefetch': '',
    prerender: ''
  }
}

var options = {}

var fonts = [
  '**/*.woff',
  '**/*.woff2',
  '**/*.ttf',
  '**/*.eot',
  '**/*.eot',
  '**/*.otf'
]

function matches (file, globs) {
  for (let i = 0, len = globs.length; i < len; i++) {
    if (minimatch(file, globs[i])) {
      return true
    }
  }
}

function buildResourceHint (hint, asset) {
  var as = 'as="'

  if (matches(asset, fonts)) {
    as += 'font"'
  } else if (isCSS(asset)) {
    as += 'style"'
  } else {
    as = ''
  }

  return `<link rel="${hint}" href="${asset}" ${as} />`
}

function mergeOptions (userOpts) {
  // iterate over existing keys
  if (!userOpts) {
    options = defaults
  } else {
    var iterate = function (obj) {
      for (var key in defaults) {
        if (typeof obj[key] === 'object' && typeof defaults[key] !== 'object') {
          // Deep compare if object found
          iterate(obj[key])
        } else if (!obj[key]) {
          // Use default since there is no user option
          options[key] = defaults[key]
        } else if (typeof defaults[key] === typeof obj[key]) {
          // Use user-defined valud
          options[key] = obj[key]
        }
      }
    }

    iterate(userOpts)
  }
}

function gulpResourceHints (opt) {
  mergeOptions(opt)

  // console.log('Options are', options)

  var stream = new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
      if (file.isNull()) {
        gutil.log('no file')

        cb(null, file)
        return
      }

      // Gather assets
      var assets = listAssets.html(String(file.contents)).map((ob) => {
        return ob.url
      })

      // Build resource hints based on user-selected assets
      var data = ''

      for (var i = 0, len = assets.length; i < len; i++) {
        Object.keys(options.paths).forEach((key) => {
          if (minimatch(assets[i], options.paths[key])) {
            data += buildResourceHint(key, assets[i])
          }
        })
      }

      file.contents = new Buffer(String(file.contents)
        .replace(options.pageToken, data))

      cb(null, file)
    }
  })

  return stream
}

module.exports = gulpResourceHints
