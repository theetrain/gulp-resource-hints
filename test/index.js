'use strict'

var gulp = require('gulp')
var resourceHints = require('../lib/')
var tap = require('tap')

tap.test('Gulping', function (childTest) {
  regularGulp()
    .on('end', () => {
      childTest.end()
    })
})

function regularGulp () {
  return gulp.src('./fixtures/*.html')
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
}
