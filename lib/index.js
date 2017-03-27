'use strict'

var listAssets = require('list-assets')
var glob = require('glob')
var isFont = require('is-font')
var isCSS = require('is-css')
var gutil = require('gulp-util')
// var PluginError = gutil.PluginError
var Transform = require('stream').Transform

// const PLUGIN_NAME = 'gulp-resource-hints'

var defaults = {
  pageToken: '##gulp-resource-hints##',
  paths: {
    prefetch: '**/*.+(png|svg|jpg|gif|woff|woff2)'
  }
}

function buildResourceHint (hint, asset) {
  console.log('building hint')
  var as = 'as="'

  if (isFont(asset)) {
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
      console.log('Inside the transform')
      if (file.isNull()) {
        gutil.log('no file')

        cb(null, file)
        return
      }

      // var resourceHints = ''
      var assets = listAssets.html(String(file.contents)).map((ob) => {
        return ob.url
      })

      gutil.log('Assets are', assets)

      var data = ''

      // Build resource hints based on user-selected assets
      Object.keys(options.paths).forEach((key) => {
        for (let i = 0, len = assets.length; i < len; i++) {
          var userAssets = glob.sync(options.paths[key])
          if (userAssets.length <= 0) {
            console.log('No assets here')
            continue
          }

          gutil.log('User assets are', userAssets)

          userAssets.forEach((asset) => {
            console.log('asset is', asset)
            data += buildResourceHint(key, asset)
          })
        }
      })

      file.contents = new Buffer(String(file.contents)
        .replace(options.pageToken, data))

      cb(null, file)
    }
  })

  // stream.on('data', () => console.log('We got data'))

  return stream
}

function stupidTest () {
  console.log('hi')
  var stream = new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
      console.log('did I make it?')

      this.push(file)
      cb()
    }
  })

  stream.on('data', function () {
    console.log('yolo')
  })

  return stream
}

module.exports = gulpResourceHints
// module.exports = stupidTest
