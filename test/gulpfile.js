// Simple test

var gulp = require('gulp')
var resourceHints = require('../lib')
var sequence = require('run-sequence')
var tap = require('tap')

gulp.task('regularGulp', function (cb) {
  return gulp.src('./fixtures/*.html')
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
    .on('end', () => {
      tap.pass('This is fine')
    })
})

gulp.task('default', function (cb) {
  sequence('regularGulp')
})
