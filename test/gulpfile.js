// Simple test

const gulp = require('gulp')
const gutil = require('gulp-util')
const resourceHints = require('../lib')
const sequence = require('run-sequence')
const tap = require('tap')
const compare = require('compare-with-file').fileMatches
const clean = require('gulp-clean')
const fs = require('fs')
const Transform = require('stream').Transform

function compareFiles (testName) {
  return new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
      var resultFile = `./fixtures/${file.relative.replace('.html', '-result.html')}`
      if (!fs.existsSync(resultFile)) {
        tap.fail(testName + ': Results file does not exist')
        cb(null, file)
        return
      }
      if (!compare(resultFile, String(file.contents))) {
        tap.fail(testName + ': File does not match expected result')
      }

      cb(null, file)
    }
  })
}

gulp.task('defaultTest', function (cb) {
  const testName = 'Default Test'

  return gulp.src('./fixtures/*(.html)!(*-result.html)')
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
    .pipe(compareFiles(testName))
    .on('end', () => {
      tap.pass(testName, 'Pass')
    })
    .on('error', () => {
      gutil.log()
      tap.fail(testName, 'Error on stream')
    })
})

gulp.task('userOptionsTest', function (cb) {
  const testName = 'User Options Test'

  return gulp.src('./fixtures/*(.html)!(*-result.html)')
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
    .on('end', () => {
      tap.pass(testName, 'Pass')
    })
    .on('error', () => {
      gutil.log()
      tap.fail(testName, 'Error on stream')
    })
})

gulp.task('clean', function (cb) {
  return gulp.src('./results/*.*')
    .pipe(clean())
})

gulp.task('default', function (cb) {
  sequence('clean', 'defaultTest', 'userOptionsTest')
})
