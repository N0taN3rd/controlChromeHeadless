module.exports = {
  UA: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.71 Safari/537.36',
  defaultOpts: {
    connectOpts: {
      host: 'localhost',
      port: 9222
    },
    timeOuts: {
      navigationTimeout: 8000,
      loadTimeout: 5000
    },
    versionInfo: {
      v: '1.0.0',
      isPartOfV: 'ChromeCrawled',
      warcInfoDescription: ''
    },
    warc: {
      naming: 'url',
      output: process.cwd()
    }
  }

}