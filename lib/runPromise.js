const cp = require('../lib/utils/colorPrinters')
function thenNoop () {}
function defaultCatcher (err) {
  cp.error('A Fatal Error Occurred', err)
  cp.bred('Please Inform The Maintainer Of This Project About It. Information In package.json')
}

function runPromise (runnable, thener = thenNoop, catcher = defaultCatcher) {
  if (typeof runnable.then === 'function') {
    runnable.then(thener).catch(catcher)
  } else {
    runnable().then(thener).catch(catcher)
  }
}

module.exports = runPromise
