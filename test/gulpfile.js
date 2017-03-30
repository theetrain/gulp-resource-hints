// Simple test

var gulp = require('gulp')
var gutil = require('gulp-util')
var resourceHints = require('../lib')
var sequence = require('run-sequence')
var tap = require('tap')
var compare = require('compare-with-file').fileMatches
var Transform = require('stream').Transform

gulp.task('defaultTest', function (cb) {
  return gulp.src('./fixtures/*(.html)!(*-result.html)')
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
    .pipe(new Transform({
      objectMode: true,
      transform: function (file, enc, cb) {
        var resultFile = `./fixtures/${file.relative.replace('.html', '-result.html')}`
        if (compare(resultFile, String(file.contents))) {
          tap.passing()
        } else {
          tap.fail('Default Test: File does not match expected result')
        }

        cb(null, file)
      }
    }))
    .on('end', () => {
      tap.pass('Default Test: Pass')
    })
    .on('error', () => {
      gutil.log()
      tap.fail('Default Test: Error on stream')
    })
})

gulp.task('default', function (cb) {
  sequence('defaultTest')
})
