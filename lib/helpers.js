var isCSS = require('is-css')
var minimatch = require('minimatch')
var defaults = require('./defaults')

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

module.exports.matches = matches

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

module.exports.buildResourceHint = buildResourceHint

function mergeOptions (userOpts) {
  // iterate over existing keys

  var options

  if (!userOpts) {
    return defaults
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
    return options
  }
}

module.exports.mergeOptions = mergeOptions
