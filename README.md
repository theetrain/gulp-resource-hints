# gulp-resource-hints
> Add resource hints to your html files

[![Build Status](https://travis-ci.org/theetrain/gulp-resource-hints.svg?branch=master)](https://travis-ci.org/theetrain/gulp-resource-hints)

## Introduction

[Resource hints](https://www.w3.org/TR/resource-hints/) are a great way to reduce loading times on your progressive website. At the time of this writing, only Chrome has support for the major resource hints, but `prefetch` and `dns-prefetch` have [fairly wide availability](http://caniuse.com/#search=resource%20hints) among browsers. Further reading [here](https://medium.com/@luisvieira_gmr/html5-prefetch-1e54f6dda15d).

## Install

```bash
$ npm install --save-dev gulp-resource-hints
```

## Usage

1. (optional) place the string `##gulp-resource-hints##` in each of your HTML files' `<head>`, ideally right after your last `<meta>` tag. If not provided, resource hints will be inserted after your last `<meta>` in your document's `<head>`, or prepended to `<head>`, whichever comes first.
1. Add `gulp-resource-hints` to one of your Gulp tasks to parse your HTML files for static and external assets, and prepend them with resource hints to their respective `<head>`.

```js
const gulp = require('gulp')
const resourceHints = require('gulp-resource-hints')

gulp.task('resourceHints', function (cb) {
  return gulp.src('./app/**/*.html')
    .pipe(resourceHints())
    .pipe(gulp.dest('./dist/'))
})
```

### Input example

**app/index.html**
```html
<html>
  <head>
  ##gulp-resource-hints##
  </head>
  <body>

    <img src="asset/image1.jpg" alt="">
    <img src="asset/image2.jpg" alt="">
    <img src="asset/image3.png" alt="">
    <img src="asset/image4.svg" alt="">
  </body>
</html>
```

### Output example

**dist/index.html**
```html
<html>
  <head>
  <link rel="prefetch" href="asset/image1.jpg" /><link rel="prefetch" href="asset/image2.jpg" /><link rel="prefetch" href="asset/image3.png" /><link rel="prefetch" href="asset/image4.svg" />
  </head>
  <body>

    <img src="asset/image1.jpg" alt="">
    <img src="asset/image2.jpg" alt="">
    <img src="asset/image3.png" alt="">
    <img src="asset/image4.svg" alt="">
  </body>
</html>
```

## Options

### resourceHints([options])

`options <Object>` - see [default options](./lib/defaults.js)

- `pageToken <String>` : add your own custom string replace token (default is **##gulp-resource-hints##**)
- `paths <Object>` : custom string patterns for their respective resource hint.
  - `dns-prefetch <String>` : custom [URL pattern](#url-patterns). Default is `//*` (all non-relative URLs)
  - `preconnect <String>` : custom URL pattern.
  - `prerender <String>` : custom [glob](https://www.npmjs.com/package/glob) pattern.
  - `prefetch <String>` : custom glob pattern. Default is all locally-served fonts and images.
  - `preload <String>` : custom glob pattern.

### URL Patterns

Similar to glob, url patterns work like so:

```js
// Example 1: single wildcard
var options = {
  paths: {
    'dns-prefetch': '*unpkg.com'
  }
}

'https://unpkg.com/react@15.3.1/dist/react.min.js' // match
'https://unpkg.com/history@4.2.0/umd/history.min.js' // match
'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js' // no match

/* ----- */

// Example 2: comma-separated wildcards
var options {
  paths: {
    preconnect: '*unpkg.com,//cdnjs.cloudflare.com*'
  }
}

'https://unpkg.com/react@15.3.1/dist/react.min.js' // match
'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/core.js' // match
'https://cdn.jsdelivr.net/jquery/3.2.1/jquery.min.js' // no match
```

---

Did my package help you out? Let me know!  
> Twitter: [@EnricoTrain](https://twitter.com/EnricoTrain) | GitHub: [theetrain](https://github.com/theetrain) | Email: [enrico@theetrain.ca](mailto:enrico@theetrain.ca)  
> [Report an issue](https://github.com/theetrain/gulp-resource-hints/issues)
