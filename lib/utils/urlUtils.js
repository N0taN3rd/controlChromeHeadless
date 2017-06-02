const partialRight = require('lodash/partialRight')
const _normalizeURL = require('normalize-url')
const fileNamify = require('filenamify-url')
const moment = require('moment')
const path = require('path')

/**
 * @desc the default URL normalization function
 * does not strip ```www`` or ```fragment```
 */
const normalizeURL = partialRight(_normalizeURL, {stripFragment: false, stripWWW: false})

/**
 * @desc wrapper around {@link https://github.com/sindresorhus/normalize-url} that
 * given a configuration for normalize-url returns a function that applies the normalization
 * to the supplied URL
 * @param {Object} configuration
 * @return {function (url: string): string}
 */
function configureURLNormalizer (configuration = {stripFragment: false, stripWWW: false}) {
  return partialRight(_normalizeURL, configuration)
}

/**
 * @desc Returns a function that will concatenate the output path with the filenamified seedURL
 * producing the full path to WARC of the page being preserved
 * @param {string} outPath the full path to the WARC file output directory
 * @return {function(seedURL: string): string}
 */
function warcNamePerURL (outPath) {
  return (seedURL) => path.join(outPath, `${fileNamify(seedURL)}-${moment().format('YYYY-MMM-DD_x')}.warc`)
}

/**
 * @desc Returns a function that provides the full path to WARC file being written to
 * @param {string} outPath  the full path to the WARC file output directory
 * @param {string} warcName the name of the WARC file to create
 * @return {function(): string}
 */
function suppliedWarcName (outPath, warcName) {
  const warcFilePath = path.join(outPath, warcName)
  return () => warcFilePath
}

module.exports = {
  normalizeURL,
  configureURLNormalizer,
  warcNamePerURL,
  suppliedWarcName
}
