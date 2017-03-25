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
  prefetch: '**/*.+(png|svg|jpg|gif|woff|woff2)'
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
  console.log('Inside gulpResourceHints')
  opt = typeof opt === 'object' ? opt : {}
  var options = Object.assign(defaults, opt)

  console.log('Options are', options)

  var stream = new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
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
      Object.keys(options).forEach((key) => {
        for (let i = 0, len = assets.length; i < len; i++) {
          var userAssets = glob.sync(options[key])
          gutil.log('User assets are', userAssets)

          userAssets.forEach((asset) => {
            data += buildResourceHint(key, asset)
          })
        }
      })

      file.contents = new Buffer(String(file.contents)
        .replace(options.pageToken), data)

      this.push(file)
      cb()
    }
  })

  stream.on('data', () => console.log('We got data'))

  return stream
}

module.exports = gulpResourceHints
