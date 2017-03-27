// Simple test

var gulp = require('gulp')
var resourceHints = require('../lib')
var sequence = require('run-sequence')
var tap = require('tap')
// var fs = require('fs')

gulp.task('images', function (cb) {
  return gulp.src('./fixtures/*(.html)!(*-result.html)')
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
    .on('end', () => {
      tap.pass('This is fine')
    })
})

gulp.task('default', function (cb) {
  sequence('images')
})
