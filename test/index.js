'use strict'

var gulp = require('gulp')
var resourceHints = require('..')
var tap = require('tap')

tap.test('Gulping', function (assert) {
  regularGulp()
    .on('end', () => {
      tap.pass('this is fine')
    })
})

function regularGulp () {
  return gulp.src('./fixtures/*.html')
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
}
