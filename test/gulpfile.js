'use strict'

const gulp = require('gulp')
const gutil = require('gulp-util')
const resourceHints = require('../lib')
const sequence = require('run-sequence')
const tap = require('tap')
const compare = require('compare-with-file').fileMatches
const clean = require('gulp-clean')
const fs = require('fs')
const Transform = require('stream').Transform

function compareFiles () {
  return new Transform({
    objectMode: true,
    transform: function (file, enc, cb) {
      var resultFile = `./fixtures/${file.relative.replace('.html', '-result.html')}`
      if (!fs.existsSync(resultFile)) {
        cb(new Error('could not read file: ' + resultFile))
      }
      if (!compare(resultFile, String(file.contents))) {
        cb(new Error('output does not match fixture: ' + resultFile))
      }

      cb(null, file)
    }
  })
}

gulp.task('defaultTest', function (cb) {
  const testName = 'Default Test'

  return gulp.src('./fixtures/test-default*(.html)!(*-result.html)')
    .pipe(resourceHints())
    .pipe(gulp.dest('./results'))
    .pipe(compareFiles())
    .on('end', () => {
      tap.pass(testName)
    })
    .on('error', () => {
      gutil.log()
      tap.fail(testName, 'Error on stream')
    })
})

gulp.task('userOptionsTest', function (cb) {
  const testName = 'User Options Test'

  return gulp.src('./fixtures/test-user*(.html)!(*-result.html)')
    .pipe(resourceHints({
      paths: {
        prefetch: '**/*.jpg'
      }
    }))
    .pipe(gulp.dest('./results'))
    .pipe(compareFiles())
    .on('end', () => {
      tap.pass(testName)
    })
    .on('error', () => {
      gutil.log()
      tap.fail(testName, 'Error on stream')
    })
})

gulp.task('expectedFailures', function (cb) {
  const testName = 'Expected Failures'

  return gulp.src('./fixtures/test-default-images.html')
    .pipe(resourceHints({
      pageToken: 'sup'
    }))
    .pipe(gulp.dest('./results'))
    .pipe(compareFiles())
    .on('error', (error) => {
      if (error.message === 'output does not match fixture: ./fixtures/test-default-images-result.html') {
        tap.pass(testName)
        process.exit() // dirty hack to prevent run-sequence from yelling about the errors IT catches
      }
    })
})

gulp.task('clean', function (cb) {
  return gulp.src('./results/*.*')
    .pipe(clean())
})

gulp.task('default', ['clean'], function (cb) {
  sequence('defaultTest', 'userOptionsTest', 'expectedFailures')
})
