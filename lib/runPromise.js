function thenNoop () {}
function defaultCatcher (err) {console.error(err)}

function runPromise (runnable, thener = thenNoop, catcher = defaultCatcher) {
  if (typeof runnable.then === 'function') {
    runnable.then(thener).catch(catcher)
  } else {
    runnable().then(thener).catch(catcher)
  }
}

module.exports = runPromise