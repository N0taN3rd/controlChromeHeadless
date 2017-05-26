const {STATUS_CODES} = require('http')
const URL = require('url')
const util = require('util')
const path = require('path')
const CDP = require('chrome-remote-interface')
const _ = require('lodash')
const Promise = require('bluebird')
const S = require('string')
const uuid = require('uuid/v1')
const fs = require('fs-extra')
const normalizeUrl = require('normalize-url')
const fileNamify = require('filenamify-url')
const RequestMonitor = require('./lib/requestMonitor')
const Crawler = require('./lib/crawler')

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

const noNaughtyJs = {
  scriptSource: `(${killAllJsAlertPromptConfirm.toString()})(window);`
}

let seedUrl = 'http://www.reuters.com/news'

const crawler = Crawler.withAutoClose()

crawler.on('error', err => {
  console.error('crawler incured an error', err)
})

crawler.on('disconnect', () => {
  console.log('connection to the remote browser closed')
})

crawler.on('navigation-timedout', url => {
  console.error(`crawler attempted to navigate to ${url} but it timedout`)
})

crawler.on('navigated', navigatedTo => {
  console.log(`crawler navigated to ${navigatedTo}`)
})

crawler.on('connected', () => {
  crawler.navigate(seedUrl)
})

crawler.on('page-loaded', async loadedInfo => {
  for (let capturedReqRes of crawler.requestMonitor.values()) {
    if (capturedReqRes.redirectResponse) {
      console.log(capturedReqRes)
    }
  }
  await crawler.shutdown()
})

crawler.init()

console.log(crawler)
// CDP({port: 9222}, async client => {
//   process.on('exit', function () {
//     if (client) client.close()
//   })
//   const {Runtime, Page, Network, DOM, Debugger} = client
//   try {
//     await Promise.all([
//       Runtime.enable(),
//       Debugger.enable(),
//       DOM.enable(),
//       Page.enable(),
//       Network.enable(), // for response body retrieval roughly 8/9 hundo mb
//     ])
//   } catch (err) {
//     console.error(err)
//   }
//
//   await Page.addScriptToEvaluateOnLoad(noNaughtyJs)
//   const requestMonitor = new RequestMonitor(Network)
//   Page.navigate({url: seedUrl}, (...args) => {
//     console.log('page navigate', ...args)
//   })
//
//   Page.loadEventFired(async (info) => {
//     await Promise.delay(2500)
//
//     for (let capturedReqRes of requestMonitor.values()) {
//       if (capturedReqRes.redirectResponse) {
//         console.log(capturedReqRes)
//       }
//     }
//     await client.close()
//   })
// })