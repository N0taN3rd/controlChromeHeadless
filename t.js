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
const Benchmark = require('benchmark')

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

  crawler.on('warc-gen-finished', async () => {
    await crawler.shutdown()
  })

  let out = []
  crawler.on('page-loaded', async loadedInfo => {
    console.log('page-loaded')
    crawler.initWARC('/home/john/WebstormProjects/controlChromeHeadless/collections/t2/archive/reuters2.warc')
    let outlinks = await crawler.getOutLinkMetadata()
    try {
      await crawler.genWarc({outlinks})
    } catch (error) {
      await crawler.shutdown()
      // console.error(error)
    }
    // for (let capturedReqRes of crawler) {
    //   out.push(capturedReqRes)
    //   // if (capturedReqRes.redirectResponse) {
    //   //   console.log(capturedReqRes)
    //   // }
    // }
    // await fs.writeJSON('out3.json', out)
  })

  crawler.init()
}

let seedPurl = URL.parse(seedUrl)

function handleOther (nreq) {
  console.log(nreq.res)
  if (nreq.method === 'OPTIONS') {
    console.log(nreq)
  }
}

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.71 Safari/537.36'

/**
 * @desc Test to see if a ``plain object`` is empty
 * @param {Object?} object
 * @return {boolean}
 */
function isEmptyPlainObject (object) {
  if (object === null || object === undefined) {
    return true
  }
  let k
  for (k in object) {
    if (object.hasOwnProperty(k)) {
      return false
    }
  }
  return true
}

function handleRedirectResponse (nreq) {
  // console.log(nreq)
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
  let headerKey
  let finalRequestHeaders
  let finalResponseHeaders
  let isMultiRedirect = Array.isArray(nreq.redirectResponse)

  /* The initial request */
  if (isMultiRedirect) {
    // multi redirection
    // the full request headers is on the first redirect
    if (nreq.redirectResponse[0].requestHeadersText) {
      requestHeaders = nreq.redirectResponse[0].requestHeadersText
    } else {
      // the full request headers was not on the first redirect
      // must create it with the bare minimum info required
      // emulates the dev tools and is what was actually sent
      head = nreq.headers
      purl = URL.parse(nreq.url)
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      if (!(head.referer || head.Referer)) {
        head['Referer'] = seedUrl
      }
      requestHeaders = `${nreq.method} ${purl.path} ${nreq.redirectResponse.protocol.toUpperCase()}\r\n`
      // no need for hasOwnProperty, https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Headers
      // states headers is a json object
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
      }
    }
  } else {
    // single redirection
    if (nreq.redirectResponse.requestHeadersText) {
      // the full request headers is on the redirect response
      requestHeaders = nreq.redirectResponse.requestHeadersText
    } else {
      // the full request headers was not on the redirect
      // must create it with the bare minimum info required
      // emulates the dev tools and is what was actually sent
      head = nreq.headers
      purl = URL.parse(nreq.url)
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      if (!(head.referer || head.Referer)) {
        head['Referer'] = seedUrl
      }
      requestHeaders = `${nreq.method} ${purl.path} ${nreq.redirectResponse.protocol.toUpperCase()}\r\n`
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
      }
    }
  }
  // console.log('--------------------------')
  // console.log(requestHeaders)
  // console.log('--------------------------')
  /* the redirection or redirection chain */

  if (isMultiRedirect) {
    // multi redirection
    // We handled the request for the first redirect, now for its response
    if (nreq.redirectResponse[0].headersText) {
      // console.log(nreq.redirectResponse[0].headersText)
    } else {
      head = nreq.redirectResponse[0].headers
      aRedirect = nreq.redirectResponse[0]
      rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}\r\n`
      for (headerKey in head) {
        rderHeaders += `${headerKey}: ${head[headerKey]}\r\n`
      }
      // console.log(rderHeaders)
    }
    // now loop through the remaining redirection chain
    redirectLen = nreq.redirectResponse.length
    redirReses = nreq.redirectResponse
    i = 1
    for (; i < redirectLen; ++i) {
      aRedirect = redirReses[i]
      console.log(aRedirect)
      if (aRedirect.headersText) {
        // console.log(aRedirect.headersText)
      } else {
        rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}\r\n`
        head = aRedirect.headers
        for (headerKey in head) {
          rderHeaders += `${headerKey}: ${head[headerKey]}\r\n`
        }
        // console.log(rderHeaders)
      }
    }
  } else {
    // single redirection
    // We handled the request for the redirect, now for its response
    if (nreq.redirectResponse.headersText) {
      // console.log(nreq.redirectResponse.headersText)
    } else {
      aRedirect = nreq.redirectResponse
      rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}\r\n`
      head = aRedirect.headers
      for (headerKey in head) {
        rderHeaders += `${headerKey}: ${head[headerKey]}\r\n`
      }
      // console.log(rderHeaders)
    }
  }

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
    for (headerKey in head) {
      finalRequestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
    }
  }

  // console.log(finalRequestHeaders)

  // response for the final request in redirection / redirection chain
  if (res.headersText) {
    finalResponseHeaders = res.headersText
  } else {
    head = res.headers
    finalResponseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}\r\n`
    for (headerKey in head) {
      finalResponseHeaders += `${headerKey}: ${head[headerKey]}\r\n`
    }
  }
  // console.log(finalResponseHeaders)
  // if their is no response body these values are undefined
  // do not request body if there is none or zero length body
  let contentLen = res.headers['Content-Length'] || res.headers['content-length'] || 0
  if (contentLen > 0) {
    // console.log(contentLen)
  }
  console.log()
}

function handlePost (nreq) {
  let res
  let requestHeaders
  let responseHeaders
  let purl
  let headerKey
  let head
  res = nreq.res
  // request
  if (res.requestHeadersText) {
    requestHeaders = res.requestHeadersText
  } else {
    purl = URL.parse(nreq.url)
    if (!(nreq.headers.host || nreq.headers.Host)) {
      nreq.headers['Host'] = purl.host
    }
    if (!(nreq.headers.referer || nreq.headers.Referer)) {
      nreq.headers['Referer'] = seedUrl
    }
    requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}\r\n`
    head = nreq.headers
    for (headerKey in head) {
      requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
    }
  }
  // console.log(requestHeaders)

  if (nreq.postData) {
    // console.log(nreq.postData)
  }

  // response
  if (res.headersText) {
    responseHeaders = res.headersText
  } else {
    responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}\r\n`
    head = res.headers
    for (headerKey in head) {
      requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
    }
  }

  // console.log(responseHeaders)
  // if their is no response body these values are undefined
  // do not request body if there is none or zero length body
  let contentLen = res.headers['Content-Length'] || res.headers['content-length'] || 0
  if (contentLen > 0) {

  }
}

function handleGet (nreq) {
  let res
  let requestHeaders
  let responseHeaders
  let purl = URL.parse(nreq.url)
  let headerKey
  let head
  let contentLen = 0
  if (Array.isArray(nreq.res)) {
    console.log('have multi responses for GET')
    res = nreq.res.pop()
  } else {
    res = nreq.res
  }
  if (res === null || res === undefined) {
    // we do not have a response
    requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1\r\n`
    if (!isEmptyPlainObject(nreq.headers)) {
      // the headers object is present
      head = nreq.headers
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      if (!(head.referer || head.Referer)) {
        head['Referer'] = seedUrl
      }
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
      }
    } else {
      // the headers object is not present, recreate with minimal information
      requestHeaders += `Host: ${purl.host}\r\nReferer: ${seedUrl}\r\nUser-Agent: ${UA}\r\n`
    }
    // console.log(requestHeaders)
  } else {
    if (res.protocol === 'data') {
      return
    }
    if (res.requestHeadersText) {
      // response has full request headers string
      requestHeaders = res.requestHeadersText
    } else if (!isEmptyPlainObject(res.requestHeaders)) {
      // response did not have the full request headers string use object
      requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}\r\n`
      head = res.requestHeaders
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      if (!(head.referer || head.Referer)) {
        head['Referer'] = seedUrl
      }
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
      }
    } else {
      // response has no full request http headers information
      requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}\r\n`
      if (!isEmptyPlainObject(nreq.headers)) {
        // the request object has the request http header object
        head = nreq.headers
        if (!(head.host || head.Host)) {
          head['Host'] = purl.host
        }
        if (!(head.referer || head.Referer)) {
          head['Referer'] = seedUrl
        }
        for (headerKey in head) {
          requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
        }
      } else {
        // the request object does not have the request http header information
        // recreate with minimal information
        requestHeaders += `Host: ${purl.host}\r\nReferer: ${seedUrl}\r\nUser-Agent: ${UA}\r\n`
      }
      console.log(requestHeaders)
    }

    if (res.headersText) {
      responseHeaders = res.headersText
      contentLen = res.headers['Content-Length'] || res.headers['content-length'] || 0
    } else if (!isEmptyPlainObject(res.headers)) {
      contentLen = res.headers['Content-Length'] || res.headers['content-length'] || 0
      head = res.headers
      responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}\r\n`
      for (headerKey in head) {
        responseHeaders += `${headerKey}: ${head[headerKey]}\r\n`
      }
    } else {
      console.log('the response headers are empty GET')
    }

    // console.log(responseHeaders)
    if (contentLen > 0) {
      // console.log(contentLen)
    }
  }
}

function handleOptions (nreq) {
  let res
  let requestHeaders
  let responseHeaders
  let purl = URL.parse(nreq.url)
  let headerKey
  let head

  // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-RequestId states that
  // the requestId we use as the key is unique to the request so we take the last element
  // no clue why we have two responses
  if (Array.isArray(nreq.res)) {
    res = nreq.res.pop()
  } else {
    res = nreq.res
  }

  if (res.requestHeadersText) {
    requestHeaders = res.requestHeadersText
  } else if (!isEmptyPlainObject(res.requestHeaders)) {
    requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}\r\n`
    head = res.requestHeaders
    if (!(head.host || head.Host)) {
      head['Host'] = purl.host
    }
    if (!(head.referer || head.Referer)) {
      head['Referer'] = seedUrl
    }
    for (headerKey in head) {
      requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
    }
  } else if (!isEmptyPlainObject(nreq.headers)) {
    requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}\r\n`
    head = nreq.headers
    if (!(head.host || head.Host)) {
      head['Host'] = purl.host
    }
    if (!(head.referer || head.Referer)) {
      head['Referer'] = seedUrl
    }
    for (headerKey in head) {
      requestHeaders += `${headerKey}: ${head[headerKey]}\r\n`
    }
  } else {
    console.log('the request headers are both empty')
  }
  console.log(requestHeaders)

  if (res.headersText) {
    responseHeaders = res.headersText
  } else if (!isEmptyPlainObject(res.headers)) {
    head = res.headers
    if (!(head.host || head.Host)) {
      head['Host'] = purl.host
    }
    if (!(head.referer || head.Referer)) {
      head['Referer'] = seedUrl
    }
    responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}\r\n`
    for (headerKey in head) {
      responseHeaders += `${headerKey}: ${head[headerKey]}\r\n`
    }
  } else {
    console.log('the response headers are empty')
  }

  console.log(responseHeaders)
}

async function doIt () {
  const netReqs = await fs.readJson('out3.json')
  let i = 0
  let len = netReqs.length
  let nreq
  for (; i < len; ++i) {
    nreq = netReqs[i]
    if (nreq.redirectResponse) {
      handleRedirectResponse(nreq)
    } else {
      switch (nreq.method) {
        case 'POST':
          // handlePost(nreq)
          break
        case 'OPTIONS':
          // handleOptions(nreq)
          break
        case 'GET':
          // handleGet(nreq)
          break
        default:
          console.log(nreq.method)
      }
    }
  }
}

doTestCrawl()

// runPromise(doIt())

async function benchIt () {
  const netReqs = await fs.readJson('out3.json')
  let suite = new Benchmark.Suite()
  suite
    .add('handleRedirectResponseForOf', function () {
      let i = 0
      let len = netReqs.length
      let nreq
      for (; i < len; ++i) {
        nreq = netReqs[i]
        if (nreq.redirectResponse) {
          handleRedirectResponse(nreq)
        } else {
          // if (nreq.method === 'POST') {
          //   handlePost(nreq)
          // } else {
          //
          // }
        }
      }
    })
    .add('handleRedirectResponseForIn', function () {
      let i = 0
      let len = netReqs.length
      let nreq
      for (; i < len; ++i) {
        nreq = netReqs[i]
        if (nreq.redirectResponse) {
          handleRedirectResponse(nreq)
        } else {
          // if (nreq.method === 'POST') {
          //   handlePost(nreq)
          // } else {
          //
          // }
        }
      }
    })
    // add listeners
    .on('cycle', function (event) {
      console.log(String(event.target))
    })
    .on('complete', function () {
      console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    // run async
    .run({'async': false})
}

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
