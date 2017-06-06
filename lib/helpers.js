'use strict'

const isCSS = require('is-css')
const minimatch = require('minimatch')
const Soup = require('soup')
const parse = require('url').parse

const defaults = require('./defaults')
var appOptions = {}
var appLoaded = false

var parsedAssets = [] // helps check for duplicates
var insertionPoint = '' // dictates where to insert resource hints

// const PLUGIN_NAME = 'gulp-resource-hints'

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

/**
 * Checking duplicates is necessary for dns-prefetch and prefetch
 * resource hints since the same web page could have multiple assets
 * from the same external host, but we only want to dns-prefetch an
 * external host once.
 */

/**
 * Check for duplicates in parsedAssets helper array
 * @param {string} assetToCheck
 * @param {boolean} isHost
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

/**
 * Unset helper variables
 */
function reset () {
  parsedAssets = []
  insertionPoint = ''
}
module.exports.reset = reset

/**
 * Log to the console unless user opts out
 * @param {string} message
 * @param {boolean} warn
 */
function logger (message, warn) {
  if (appOptions.silent) {
    return
  }
  if (warn) {
    console.warn(message)
    return
  }

  console.log(message)
}
module.exports.logger = logger

/**
 * Determine if file has a valid area to inject resource hints
 * @param {stream} file
 */
function hasInsertionPoint (file) {
  var token = appOptions.pageToken

  if (token !== '' && String(file.contents).indexOf(token) > -1) {
    insertionPoint = 'token'
    return true
  } else if (token !== '' && token !== defaults.pageToken) {
    logger('Token not found in ' + file.relative)
  }

  var soup = new Soup(String(file.contents))

  // Append after metas
  soup.setInnerHTML('head > meta:last-of-type', function (oldHTML) {
    if (oldHTML !== null) {
      insertionPoint = 'meta'
      return oldHTML
    }
  })

  if (insertionPoint) {
    return true
  }

  // Else, prepend before links
  soup.setInnerHTML('head > link:first-of-type', function (oldHTML) {
    if (oldHTML !== null) {
      insertionPoint = 'link'
      return oldHTML
    }
  })

  if (insertionPoint) {
    return true
  }

  // Else, append to head
  soup.setInnerHTML('head', function (oldHTML) {
    if (oldHTML !== null) {
      insertionPoint = 'head'
      return oldHTML
    }
  })

  return insertionPoint
}
module.exports.hasInsertionPoint = hasInsertionPoint

/**
 * Validate asset is desireable by user
 * Build resource hint if so
 * @param {string} hint
 * @param {string} asset
 * @param {string} glob
 * @return {string}
 */
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

/**
 * Merge user options with defaults
 * @param {object} userOpts
 * @return {object}
 */
function options (userOpts) {
  if (appLoaded && typeof userOpts === 'undefined') {
    return appOptions
  }
  userOpts = typeof userOpts === 'object' ? userOpts : {}
  appOptions = Object.assign({}, defaults, userOpts)
  appOptions.paths = Object.assign({}, defaults.paths, userOpts.paths)
  appLoaded = true

  return appOptions
}
module.exports.options = options

/**
 * Write resource hints to file
 * @param {stream} file
 * @param {string} data
 * @param {string} token
 * @return {string}
 */
function writeDataToFile (file, data, token) {
  // insertionPoint was set in hasInsertionPoint(), so we can assume it is safe to write to file
  var selectors = [
    'head > meta:last-of-type',
    'head > link:first-of-type',
    'head'
  ]
  var selectorIndex = 0

  switch (insertionPoint) {
    case 'meta':
      selectorIndex = 0
      break
    case 'link':
      selectorIndex = 1
      break
    case 'head':
      selectorIndex = 2
      break
    case 'token':
      let html = String(file.contents).replace(token, data)
      return new Buffer(html)
    default:
      return ''
  }

  var soup = new Soup(String(file.contents))

  // Inject Resource Hints
  soup.setInnerHTML(selectors[selectorIndex], function (oldHTML) {
    if (insertionPoint === 'link') {
      return data + oldHTML
    }
    return oldHTML + data
  })

  return soup.toString()
}
module.exports.writeDataToFile = writeDataToFile
