'use strict'

var gulp = require('gulp')
var resourceHints = require('../lib/')
var tap = require('tap')
var Transform = require('stream').Transform

tap.test('Gulping', function (childTest) {
  regularGulp()
    .on('end', () => {
      childTest.end()
    })
})

function regularGulp () {
  return gulp.src('./fixtures/*.html')
    .pipe(new Transform({
      transform: function (file, enc, cb) {
        console.log('stupid test')
      }
    }))
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
}
