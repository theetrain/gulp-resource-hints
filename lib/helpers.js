const isCSS = require('is-css')
const minimatch = require('minimatch')
const defaults = require('./defaults')
const Soup = require('soup')

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
  var hasMeta, hasLink, hasHead

  // Append after metas
  soup.setInnerHTML('head > meta:last-of-type', function (oldHTML) {
    if (oldHTML === '') {
      hasMeta = false
      return
    }
    hasMeta = true
    return oldHTML + data
  })

  // Else, prepend before links
  if (!hasMeta) {
    soup.setInnerHTML('head > link:first-of-type', function (oldHTML) {
      if (oldHTML === '') {
        hasLink = false
        return
      }
      hasLink = true
      return data + oldHTML
    })
  }

  // Else, append to head
  if (!hasLink) {
    soup.setInnerHTML('head', function (oldHTML) {
      if (oldHTML === '') {
        hasHead = false
        return
      }
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
