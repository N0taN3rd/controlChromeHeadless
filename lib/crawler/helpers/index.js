function killAllJsAlertPromptConfirm (win) {
  Object.defineProperty(win, 'onbeforeunload', {
    configurable: false,
    writeable: false,
    value: function () {}
  })
  Object.defineProperty(win, 'onunload', {
    configurable: false,
    writeable: false,
    value: function () {}
  })
  window.alert = function () {}
  window.confirm = function () {}
  window.prompt = function () {}
  win.alert = function () {}
  win.confirm = function () {}
  win.prompt = function () {}
}

function getMeOutLinks () {
  return Array.from(document.links).map(it => `outlink: ${it.href} L a/@href\r\n`).join('')
}

function getMeNewSeeds () {
  return Array.from(document.links).map(it => it.href)
}

const pageEval = {
  expression: `(${getMeOutLinks.toString()})()`,
  includeCommandLineAPI: true,
  generatePreview: true,
  returnByValue: true
}

const newSeeds = {
  expression: `(${getMeNewSeeds.toString()})()`,
  includeCommandLineAPI: true,
  generatePreview: true,
  returnByValue: true
}

const noNaughtyJs = {
  scriptSource: `(${killAllJsAlertPromptConfirm.toString()})(window);`
}

module.exports = {
  pageEval,
  newSeeds,
  noNaughtyJs
}