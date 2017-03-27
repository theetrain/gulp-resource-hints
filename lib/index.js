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
    prefetch: '**/*.+(png|svg|jpg|gif|woff|woff2)'
  }
}

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

function gulpResourceHints (opt) {
  opt = typeof opt === 'object' ? opt : {}
  var options = Object.assign(defaults, opt)

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

      for (let i = 0, len = assets.length; i < len; i++) {
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
