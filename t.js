const Promise = require('bluebird')
const {STATUS_CODES} = require('http')
const URL = require('url')
const util = require('util')
const path = require('path')
const CDP = require('chrome-remote-interface')
const _ = require('lodash')
const S = require('string')
const uuid = require('uuid/v1')
const fs = require('fs-extra')
const normalizeUrl = require('normalize-url')
const fileNamify = require('filenamify-url')
const RequestMonitor = require('./lib/requestMonitor')
const Crawler = require('./lib/crawler')
const runPromise = require('./lib/runPromise')

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

function doTestCrawl () {
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

  let out = []
  crawler.on('page-loaded', async loadedInfo => {
    console.log('page-loaded')
    for (let capturedReqRes of crawler) {
      out.push(capturedReqRes)
      // if (capturedReqRes.redirectResponse) {
      //   console.log(capturedReqRes)
      // }
    }
    await fs.writeJSON('out3.json', out)
    await crawler.shutdown()
  })

  crawler.init()

}

let seedPurl = URL.parse(seedUrl)

function handleRedirectResponse (nreq) {
  /*
   The browser will automatically chase down 3xx responses until terminal
   status is reached 2xx, 4xx, 5xx. So we must account for that fact and the
   redirectResponse is guarantied to be an array or plain object.
   */
  // optimization for function speed by pulling up let decelerations
  let purl // a parsed URL
  let rderHeaders // a redirection responses HTTP headers string
  let redirReses // an array of redirection responses
  let head // a header object
  let i // the one and only i
  let aRedirect // a redirection response
  let redirectLen
  let requestHeaders // the HTTP headers string for the initial request that redirected
  let res // the response object
  let finalRequestHeaders
  let finalResponseHeaders
  let isMultiRedirect = Array.isArray(nreq.redirectResponse)
  /* The initial request */
  // if (isMultiRedirect) {
  //   // multi redirection
  //   // the full request headers is on the first redirect
  //   if (nreq.redirectResponse[0].requestHeadersText) {
  //     requestHeaders = nreq.redirectResponse[0].requestHeadersText
  //   } else {
  //     // the full request headers was not on the first redirect
  //     // must create it with the bare minimum info required
  //     // emulates the dev tools and is what was actually sent
  //     purl = URL.parse(nreq.url)
  //     if (!(nreq.headers.host || nreq.headers.Host)) {
  //       nreq.headers['Host'] = purl.host
  //     }
  //     if (!(nreq.headers.referer || nreq.headers.Referer)) {
  //       nreq.headers['Referer'] = seedUrl
  //     }
  //     requestHeaders = `${nreq.method} ${purl.path} ${nreq.redirectResponse.protocol.toUpperCase()}\r\n`
  //     for (let [k, v] of Object.entries(nreq.headers)) {
  //       requestHeaders += `${k}: ${v}\r\n`
  //     }
  //   }
  // } else {
  //   // single redirection
  //   if (nreq.redirectResponse.requestHeadersText) {
  //     // the full request headers is on the redirect response
  //     requestHeaders = nreq.redirectResponse.requestHeadersText
  //   } else {
  //     // the full request headers was not on the redirect
  //     // must create it with the bare minimum info required
  //     // emulates the dev tools and is what was actually sent
  //     purl = URL.parse(nreq.url)
  //     if (!(nreq.headers.host || nreq.headers.Host)) {
  //       nreq.headers['Host'] = purl.host
  //     }
  //     if (!(nreq.headers.referer || nreq.headers.Referer)) {
  //       nreq.headers['Referer'] = seedUrl
  //     }
  //     requestHeaders = `${nreq.method} ${purl.path} ${nreq.redirectResponse.protocol.toUpperCase()}\r\n`
  //     for (let [k, v] of Object.entries(nreq.headers)) {
  //       // just in case : prefixed information is included
  //       requestHeaders += `${k}: ${v}\r\n`
  //     }
  //
  //   }
  // }
  // console.log('--------------------------')
  // console.log(requestHeaders)
  // console.log('--------------------------')
  /* the redirection or redirection chain */

  // if (isMultiRedirect) {
  //   // multi redirection
  //   // We handled the request for the first redirect, now for its response
  //   if (nreq.redirectResponse[0].headersText) {
  //     console.log(nreq.redirectResponse[0].headersText)
  //   } else {
  //     head = nreq.redirectResponse[0].headers
  //     aRedirect = nreq.redirectResponse[0]
  //     rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}\r\n`
  //     for (let [k, v] of Object.entries(head)) {
  //       rderHeaders += `${k}: ${v}\r\n`
  //     }
  //     console.log(rderHeaders)
  //   }
  //   // now loop through the remaining redirection chain
  //   redirectLen = nreq.redirectResponse.length
  //   redirReses = nreq.redirectResponse
  //   i = 1
  //   for (; i < redirectLen; ++i) {
  //     aRedirect = redirReses[i]
  //     if (aRedirect.headersText) {
  //       console.log(aRedirect.headersText)
  //     } else {
  //       rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}\r\n`
  //       for (let [k, v] of Object.entries(aRedirect.headers)) {
  //         rderHeaders += `${k}: ${v}\r\n`
  //       }
  //       console.log(rderHeaders)
  //     }
  //   }
  // } else {
  //   // single redirection
  //   // We handled the request for the redirect, now for its response
  //   if (nreq.redirectResponse.headersText) {
  //     console.log(nreq.redirectResponse.headersText)
  //   } else {
  //     aRedirect = nreq.redirectResponse
  //     rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}\r\n`
  //     for (let [k, v] of Object.entries(aRedirect.headers)) {
  //       rderHeaders += `${k}: ${v}\r\n`
  //     }
  //     console.log(rderHeaders)
  //   }
  // }

  /* the final response (maybe has body) */
  res = nreq.res
  // request for the final response in redirection / redirection chain
  if (res.requestHeadersText) {
    finalRequestHeaders = res.requestHeadersText
  } else {
    head = res.requestHeaders
    purl = URL.parse(res.url)
    if (!(head.host || head.Host)) {
      head['Host'] = purl.host
    }
    if (!(head.referer || head.Referer)) {
      head['Referer'] = seedUrl
    }
    finalRequestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}\r\n`
    for (let [k, v] of Object.entries(head)) {
      // just in case : prefixed information is included
      finalRequestHeaders += `${k}: ${v}\r\n`
    }
  }

  console.log(finalRequestHeaders)

  // response for the final request in redirection / redirection chain
  if (res.headersText) {
    finalResponseHeaders = res.headersText
  } else {
    finalResponseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}\r\n`
    for (let [k, v] of Object.entries(res.headers)) {
      finalResponseHeaders += `${k}: ${v}\r\n`
    }
  }
  console.log(finalResponseHeaders)
  // console.log('+++++++++++++++++++++++++++')

  // if (nreq.redirectResponse.headersText) {
  //   // console.log('redirectResponse has headersText')
  // } else {
  //   console.log('redirectResponse no has headersText')
  //   // console.log(nreq.redirectResponse.url)
  //   // console.log((nreq.redirectResponse.headers['location'] || nreq.redirectResponse.headers['Location']))
  //   // purl = URL.parse(nreq.url)
  //   // if (!(nreq.redirectResponse.headers.host || nreq.redirectResponse.headers.Host)) {
  //   //   nreq.redirectResponse.headers['Host'] = purl.host === seedPurl.host ? seedPurl.host : purl.host
  //   // }
  //   // if (!(nreq.redirectResponse.headers.referer || nreq.redirectResponse.headers.Referer)) {
  //   //   nreq.redirectResponse.headers['Referer'] = seedUrl
  //   // }
  //   console.log(nreq.url, nreq.method)
  //   console.log(nreq.redirectResponse)
  //   // if (nreq.redirectResponse.statusText) {
  //   //   console.log(nreq.redirectResponse.statusText)
  //   // } else {
  //   //   console.log(nreq.redirectResponse.protocol, nreq.redirectResponse.status, STATUS_CODES[nreq.redirectResponse.status])
  //   // }
  // }
  //
  // if (nreq.res.requestHeadersText) {
  //   console.log('302 location request has request headers text')
  // } else {
  //   console.log('302 location request no has request headers text')
  //   // console.log(nreq.res.url === nreq.url)
  //   console.log(nreq.res.requestHeaders)
  // }
  //
  // if (nreq.res.headersText) {
  //   console.log('302 location response has headers text')
  // } else {
  //   console.log('302 location response no has headers text')
  //   console.log(nreq.res.headers)
  // }
}

async function doIt () {
  const netReqs = await fs.readJson('out3.json')
  let i = 0
  let len = netReqs.length
  let nreq
  for (; i < len; ++i) {
    nreq = netReqs[i]
    // console.log(nreq)
    // if (nreq.url.indexOf('{') !== -1) {
    //   console.log(encodeURI(nreq.url))
    // }
    // console.log('------------------')
    if (nreq.redirectResponse) {
      // console.log('--------------------------')
      handleRedirectResponse(nreq)
      // console.log('--------------------------')
      // console.log()
    }
  }
}

// doTestCrawl()

runPromise(doIt())

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