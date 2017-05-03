'use strict'

module.exports = {
  pageToken: '##gulp-resource-hints##',
  getCSSAssets: true,
  silent: false,
  paths: {
    'dns-prefetch': '//*',
    preconnect: '',
    prerender: '',
    prefetch: '**/*.+(png|svg|jpg|jpeg|gif|woff|woff2)',
    preload: ''
  }
}
