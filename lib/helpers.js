const isCSS = require('is-css')
const minimatch = require('minimatch')
const defaults = require('./defaults')
const Soup = require('soup')
const parse = require('url').parse

var fonts = [
  '**/*.woff',
  '**/*.woff2',
  '**/*.ttf',
  '**/*.eot',
  '**/*.eot',
  '**/*.otf'
]

function urlMatch (pattern, input) {
  var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|/-])/g, '\\$1').replace(/\*/g, '.*'))
  return re.test(input)
}

function globMatch (file, globs) {
  for (let i = 0, len = globs.length; i < len; i++) {
    if (minimatch(file, globs[i])) {
      return true
    }
  }
}

function hasDuplicate (asset, list) {
  return list.find(function (el) {
    return el === asset
  })
}
module.exports.hasDuplicate = hasDuplicate

function buildResourceHint (hint, asset) {
  var as = ''

  if (hint === 'dns-prefetch' || hint === 'preconnect') {
    if (!urlMatch(asset)) {
      return
    }

    var url = parse.url(asset)
    asset = url.protocol + '//' + url.hostname
  } else {
    if (globMatch(asset, fonts)) {
      as += 'as="font"'
    } else if (isCSS(asset)) {
      as += 'as="style"'
    }
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
    console.warn('Provided token was not found')
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
    console.warn('No document <head> found, cannot write resource hints. Skipping file:', file.relative)
    return false
  }

  return soup.toString()
}
module.exports.writeData = writeData
