'use strict'

const isCSS = require('is-css')
const minimatch = require('minimatch')
const Soup = require('soup')
const gutil = require('gulp-util')
const parse = require('url').parse

const defaults = require('./defaults')

const PLUGIN_NAME = 'gulp-resource-hints'
var parsedAssets = []

var fonts = [
  '**/*.woff',
  '**/*.woff2',
  '**/*.ttf',
  '**/*.eot',
  '**/*.eot',
  '**/*.otf'
]

// Determines if url matches glob pattern
function urlMatch (asset, pattern) {
  var multi = pattern.split(',')
  var re

  if (multi.length > 1) {
    for (var i = 0, len = multi.length; i < len; i++) {
      re = new RegExp(multi[i].replace(/([.?+^$[\]\\(){}|/-])/g, '\\$1').replace(/\*/g, '.*'))
      if (re.test(asset)) {
        return true
      }
    }
    return false
  }

  re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|/-])/g, '\\$1').replace(/\*/g, '.*'))
  return re.test(asset)
}

function urlParse (asset) {
  var url = parse(asset, false, true)
  if (url.protocol === null) {
    url.protocol = ''
  }
  return url.protocol + '//' + url.hostname
}

function globMatch (file, globs) {
  for (let i = 0, len = globs.length; i < len; i++) {
    if (minimatch(file, globs[i])) {
      return true
    }
  }
}

function clearParsedAssets () {
  parsedAssets = []
}
module.exports.clearParsedAssets = clearParsedAssets

/**
 * Checking duplicates is necessary for dns-prefetch and prefetch
 * resource hints since the same web page could have multiple assets
 * from the same external host, but we only want to dns-prefetch an
 * external host once.
 */
function isDuplicate (assetToCheck, isHost) {
  if (parsedAssets.length <= 0) {
    return false
  }
  return ~parsedAssets.findIndex(function (asset) {
    if (isHost) {
      //  We don't want to preconnect twice, eh?
      return asset.split('//')[1] === assetToCheck.split('//')[1]
    }
    return asset === assetToCheck
  })
}

// Checks if asset matches user glob pattern
// Writes resource hint if it does
function buildResourceHint (hint, asset, glob) {
  var as = ''

  if (hint === 'dns-prefetch' || hint === 'preconnect') {
    if (!urlMatch(asset, glob)) {
      return ''
    }

    asset = urlParse(asset)
    if (isDuplicate(asset, true)) {
      return ''
    }
  } else {
    if (!minimatch(asset, glob) || isDuplicate(asset)) {
      return ''
    }
    if (globMatch(asset, fonts)) {
      as += ' as="font"'
    } else if (isCSS(asset)) {
      as += ' as="style"'
    }
  }

  parsedAssets.push(asset)
  return `<link rel="${hint}" href="${asset}"${as} />`
}
module.exports.buildResourceHint = buildResourceHint

function mergeOptions (userOpts) {
  // iterate over existing keys

  var options = {}

  if (!userOpts) {
    return defaults
  } else {
    var iterate = function (obj) {
      for (var key in defaults) {
        if (typeof obj[key] === 'object' && typeof defaults[key] !== 'object') {
          // Deep compare if object found
          iterate(obj[key])
        } else if (!obj[key] && defaults[key] !== '') {
          // Use non-blank default since there is no user option
          options[key] = defaults[key]
        } else if (typeof defaults[key] === typeof obj[key]) {
          // Use user-defined value only if the type matches
          options[key] = obj[key]
        }
      }
    }

    iterate(userOpts)
    return options
  }
}
module.exports.mergeOptions = mergeOptions

function writeData (file, data, token) {
  if (token !== '' && String(file.contents).indexOf(token) > -1) {
    let html = String(file.contents).replace(token, data)
    return new Buffer(html)
  }

  if (token !== '' && token !== defaults.pageToken) {
    gutil.log(PLUGIN_NAME, 'Provided token was not found in: ' + file.relative + '\nWill attempt to append to <head>')
  }
  var soup = new Soup(String(file.contents))
  var hasMeta = false
  var hasLink = false
  var hasHead = false

  // Append after metas
  soup.setInnerHTML('head > meta:last-of-type', function (oldHTML) {
    hasMeta = true
    return oldHTML + data
  })

  // Else, prepend before links
  if (!hasMeta) {
    soup.setInnerHTML('head > link:first-of-type', function (oldHTML) {
      hasLink = true
      return data + oldHTML
    })
  }

  // Else, append to head
  if (!hasMeta && !hasLink) {
    soup.setInnerHTML('head', function (oldHTML) {
      hasHead = true
      return oldHTML + data
    })
  }

  // No head? Oh noes!
  if (!hasHead) {
    gutil.log(PLUGIN_NAME, 'No document <head> found, cannot write resource hints. Skipping file:', file.relative)
    return false
  }

  return soup.toString()
}
module.exports.writeData = writeData
