'use strict'

var gulp = require('gulp')
var resourceHints = require('../lib')
// var Transform = require('stream').Transform
var tap = require('tap')
var sequence = require('run-sequence')
// var assert = require('assert')
// var es = require('event-stream')
// var PassThrough = require('stream').PassThrough

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

tap.test('Gulping', function (childTest) {
  var done = function () {
    console.log('it is over')
    childTest.end()
  }

  gulp.start('regularGulp')
    .on('end', done)

  // sequence('regularGulp', done)
})

// describe('regular-gulp', function () {
//   it('should stream normally', function (done) {
//     var stream = resourceHints()

//   })
// })
