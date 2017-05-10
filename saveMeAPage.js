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

function writeWarcEntryBlock (writeStream, ...rest) {
  return new Promise((resolve, reject) => {
    let dataIter = rest[Symbol.iterator]()
    let doWrite = () => {
      let next = dataIter.next()
      if (!next.done) {
        writeStream.write(next.value, 'utf8', doWrite)
      } else {
        resolve()
      }
    }
    doWrite()
  })
}

function * iterateReqRes (requests, responses) {
  for (let [k, v] of requests.entries()) {
    if (responses.has(k)) {
      yield {
        req: v,
        res: responses.get(k)
      }
    } else {
      yield {
        req: v
      }
    }
  }
}

function killAllJsAlertPromptConfirm (win) {
  Object.defineProperty(win, 'onbeforeunload', {
    configurable: false,
    writeable: false,
    value: function () {}
  });
  Object.defineProperty(win, 'onunload', {
    configurable: false,
    writeable: false,
    value: function () {}
  });
  window.alert = function () {};
  window.confirm = function () {};
  window.prompt = function () {};
  win.alert = function () {};
  win.confirm = function () {};
  win.prompt = function () {};
}

function getMeOutLinks () {
  return Array.from(document.links).map(it => `outlink: ${it.href} L a/@href\r\n`).join('')
}

function getMeNewSeeds () {
  return Array.from(document.links).map(it => it.href)
}

const warcHeader =
  'WARC/1.0\r\n' +
  'WARC-Type: warcinfo\r\n' +
  'WARC-Date: {{now}}\r\n' +
  'WARC-Filename: {{fileName}}\r\n' +
  'WARC-Record-ID: <urn:uuid:{{rid}}>\r\n' +
  'Content-Type: application/warc-fields\r\n' +
  'Content-Length: {{len}}\r\n'

const warcHeaderContent =
  'software: WAIL/{{version}}\r\n' +
  'format: WARC File Format 1.0\r\n' +
  'conformsTo: http://bibnum.bnf.fr/WARC/WARC_ISO_28500_version1_latestdraft.pdf\r\n' +
  'isPartOf: {{isPartOfV}}\r\n' +
  'description: {{warcInfoDescription}}\r\n' +
  'robots: ignore\r\n' +
  'http-header-user-agent: {{ua}}\r\n'

const warcMetadataHeader =
  'WARC/1.0\r\n' +
  'WARC-Type: metadata\r\n' +
  'WARC-Target-URI: {{targetURI}}\r\n' +
  'WARC-Date: {{now}}\r\n' +
  'WARC-Concurrent-To: <urn:uuid:{{concurrentTo}}>\r\n' +
  'WARC-Record-ID: <urn:uuid:{{rid}}>\r\n' +
  'Content-Type: application/warc-fields\r\n' +
  'Content-Length: {{len}}\r\n'

const warcRequestHeader =
  'WARC/1.0\r\n' +
  'WARC-Type: request\r\n' +
  'WARC-Target-URI: {{targetURI}}\r\n' +
  'WARC-Date: {{now}}\r\n' +
  'WARC-Concurrent-To: <urn:uuid:{{concurrentTo}}>\r\n' +
  'WARC-Record-ID: <urn:uuid:{{rid}}>\r\n' +
  'Content-Type: application/http; msgtype=request\r\n' +
  'Content-Length: {{len}}\r\n'

const warcResponseHeader =
  'WARC/1.0\r\n' +
  'WARC-Type: response\r\n' +
  'WARC-Target-URI: {{targetURI}}\r\n' +
  'WARC-Date: {{now}}\r\n' +
  'WARC-Record-ID: <urn:uuid:{{rid}}>\r\n' +
  'Content-Type: application/http; msgtype=response\r\n' +
  'Content-Length: {{len}}\r\n'

const recordSeparator = '\r\n\r\n'

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.36 Safari/537.36'
const args = require('yargs').argv
const swapper = S('')
const seedUrl = normalizeUrl(args.seed || args.url, {stripFragment: false, stripWWW: false})
const port = args.port || 9222
const allLinksOnPage = args.allLinks || false
const outDir = args.outDir || process.cwd()

let outPath = args.warcPath

if (outPath === undefined || outPath === null) {
  let now = new Date().toISOString()
  now = now.substr(0, now.indexOf('.')) + 'Z'
  outPath = path.join(outDir, `${fileNamify(seedUrl)}-${now}.warc`)
}

// Array.from($x('//img[//@src]')).map(it => it.src).filter(it => it !== '')
// Array.from(document.links).map(it => it.href)

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

if (allLinksOnPage) {
  let initial = true
  CDP({port}, async client => {
    process.on('exit', function () {
      if (client) client.close()
    })
    // basic setup to ensure necessary we hook into basic internals
    console.time('preserve page')
    const {Runtime, Page, Network, DOM, Debugger} = client
    try {
      await Promise.all([
        Runtime.enable(),
        Debugger.enable(),
        DOM.enable(),
        Page.enable(),
        Network.enable({maxTotalBufferSize: 1000000000}), // for response body retrieval roughly 8/9 hundo mb
      ])
    } catch (err) {
      console.error(err)
    }

    await Page.addScriptToEvaluateOnLoad(noNaughtyJs)

    let pageReqs = new Map()
    let pageRes = new Map()
    let capture = true
    let crawlThese = []
    Page.navigate({url: seedUrl}, (...args) => {
      console.log('page navigate', ...args)
    })
    Network.requestWillBeSent((info) => {
      if (capture) {
        pageReqs.set(info.requestId, info)
      }

    })
    Network.responseReceived((info) => {
      if (capture) {
        pageRes.set(info.requestId, info)
      }
    })
    Page.loadEventFired(async (info) => {
      await Promise.delay(2500)
      let warcOut
      if (initial) {
        warcOut = fs.createWriteStream(outPath)
      } else {
        warcOut = fs.createWriteStream(outPath, {flags: 'a'})
      }
      warcOut.on('error', async err => {
        console.error('error happened while witting the WARC', err)
        warcOut.end()
        await client.close()
      })
      warcOut.on('finish', async () => {
        if (initial) {
          console.log('WARC created')
        } else {
          console.log('WARC updated')
        }
        // this.emit('finished')
        warcOut.destroy()
        console.timeEnd('preserve page')
        if (crawlThese.length > 0) {
          capture = true
          pageRes.clear()
          pageReqs.clear()//allLinks
          let url = crawlThese.shift()
          console.time('preserve page')
          Page.navigate({url}, (...args) => {
            console.log('page navigate', url)
            console.log('remaining', crawlThese.length)
          })
        } else {
          await client.close()
        }
      })
      capture = false
      let now = new Date().toISOString()
      now = now.substr(0, now.indexOf('.')) + 'Z'
      let rid = uuid()
      swapper.setValue(warcHeaderContent)
      let whc = Buffer.from('\r\n' + swapper.template({
          version: '0.1',
          isPartOfV: 'chromeCrawled',
          warcInfoDescription: 'real chrome crawled',
          ua: UA
        }).s + '\r\n', 'utf8')
      let wh = Buffer.from(swapper.setValue(warcHeader).template({
        fileName: path.basename(outPath),
        now,
        len: whc.length,
        rid
      }).s, 'utf8')
      await writeWarcEntryBlock(warcOut, wh, whc, recordSeparator)
      let evaluatedPage
      let outlinks
      let evalFailed = false
      try {
        if (initial) {
          evaluatedPage = await Runtime.evaluate(newSeeds)
        } else {
          evaluatedPage = await Runtime.evaluate(pageEval)
        }
      } catch (error) {
        console.error(error)
        evalFailed = true
        outlinks = ''
      }
      if (!evalFailed) {
        if (initial) {
          outlinks = evaluatedPage.result.value.map(it => `outlink: ${it} L a/@href\r\n`).join('')
          let seen = new Set()
          crawlThese = evaluatedPage.result.value.map(it => normalizeUrl(it, {
            stripFragment: true,
            stripWWW: false
          })).filter(it => {
            let have = seen.has(it)
            if (!have) {
              seen.add(it)
            }
            return !have
          })
        } else {
          outlinks = evaluatedPage.result.value
        }
      }
      let wmhc = Buffer.from(`\r\n${outlinks}\r\n`, 'utf8')
      let wmh = Buffer.from(swapper.setValue(warcMetadataHeader).template({
        targetURI: seedUrl,
        now,
        len: wmhc.length,
        concurrentTo: rid,
        rid: uuid()
      }).s, 'utf8')
      await writeWarcEntryBlock(warcOut, wmh, wmhc, recordSeparator)
      for (let {req, res} of iterateReqRes(pageReqs, pageRes)) {
        if (res) {
          let requestHttpString
          let responseHttpString
          if (res.response.requestHeadersText === undefined || res.response.requestHeadersText === null) {
            if (res.response.requestHeaders === undefined || res.response.requestHeaders === null) {
              let purl = URL.parse(req.request.url)
              requestHttpString = `${req.request.method} ${purl.path} HTTP/1.1\r\nHost: ${purl.host}\r\nConnection: keep-alive\r\nUser-Agent: ${UA}\r\nAccept: */*\r\n`
              requestHttpString += req.request.headers['Referer'] ? `Referer: ${req.request.headers['Referer']}\r\n` : `Referer: ${seedUrl}\r\n\r\n`
            } else {
              let requestHeaders = res.response.requestHeaders
              requestHttpString = `${requestHeaders[':method']} ${requestHeaders[':path']} HTTP/1.1\r\n`
              for (let [k, v] of Object.entries(requestHeaders)) {
                if (k[0] !== ':') {
                  requestHttpString += `${k}: ${v}\r\n`
                }
              }
              requestHttpString += '\r\n'
            }
          } else {
            requestHttpString = res.response.requestHeadersText
          }
          if (res.response.headersText === undefined || res.response.headersText === null) {
            responseHttpString = `HTTP/1.1 ${res.response.status} ${STATUS_CODES[res.response.status]}\r\n`
            for (let [k, v] of Object.entries(res.response.headers)) {
              if (k[0] !== ':') {
                responseHttpString += `${k}: ${v}\r\n`
              }
            }
            responseHttpString += '\r\n'
          } else {
            responseHttpString = res.response.headersText
          }
          swapper.setValue(warcRequestHeader)
          let reqHeadContentBuffer
          if (req.request.postData) {
            reqHeadContentBuffer = Buffer.from(`\r\n ${requestHttpString}${req.request.postData}\r\n`, 'utf8')
          } else {
            reqHeadContentBuffer = Buffer.from('\r\n' + requestHttpString, 'utf8')
          }
          let reqWHeader = swapper.template({
            targetURI: req.request.url,
            concurrentTo: rid,
            now,
            rid: uuid(),
            len: reqHeadContentBuffer.length
          }).s
          await writeWarcEntryBlock(warcOut, reqWHeader, reqHeadContentBuffer, recordSeparator)
          let resData
          try {
            let rbody = await Network.getResponseBody({requestId: req.requestId})
            if (rbody.base64Encoded) {
              resData = Buffer.from(rbody.body, 'base64')
            } else {
              resData = Buffer.from(rbody.body, 'utf8')
            }
          } catch (err) {
            resData = Buffer.from([])
            console.error(err)
            console.error(req.request.url)
          }
          let resHeaderContentBuffer = Buffer.from('\r\n' + responseHttpString, 'utf8')
          let respWHeader = swapper.setValue(warcResponseHeader).template({
            targetURI: req.request.url,
            now,
            rid: uuid(),
            len: resHeaderContentBuffer.length + resData.length
          }).s
          await writeWarcEntryBlock(warcOut, respWHeader, resHeaderContentBuffer, resData, '\r\n', recordSeparator)
        } else {
          console.log('boooo')
        }
      }
      initial = false
      warcOut.end()
    })
  })
} else {
  CDP({port}, async client => {
    process.on('exit', function () {
      if (client) client.close()
    })
    // basic setup to ensure necessary we hook into basic internals
    console.time('preserve page')
    const {Runtime, Page, Network, DOM, Debugger} = client
    try {
      await Promise.all([
        Runtime.enable(),
        Debugger.enable(),
        DOM.enable(),
        Page.enable(),
        Network.enable({maxTotalBufferSize: 1000000000}), // for response body retrieval roughly 8/9 hundo mb
      ])
    } catch (err) {
      console.error(err)
    }

    await Page.addScriptToEvaluateOnLoad(noNaughtyJs)

    let pageReqs = new Map()
    let pageRes = new Map()
    let capture = true

    Page.navigate({url: seedUrl}, (...args) => {
      console.log('page navigate', ...args)
    })
    Network.requestWillBeSent((info) => {
      if (capture) {
        pageReqs.set(info.requestId, info)
      }

    })
    Network.responseReceived((info) => {
      if (capture) {
        pageRes.set(info.requestId, info)
      }
    })
    Page.loadEventFired(async (info) => {
      await Promise.delay(2500)
      let warcOut = fs.createWriteStream(outPath)
      warcOut.on('error', async err => {
        console.error('error happened while witting the WARC', err)
        warcOut.end()
        await client.close()
      })
      warcOut.on('finish', async () => {
        console.log('WARC created')
        // this.emit('finished')
        warcOut.destroy()
        console.timeEnd('preserve page')
        await client.close()
      })
      capture = false
      let now = new Date().toISOString()
      now = now.substr(0, now.indexOf('.')) + 'Z'
      let rid = uuid()
      swapper.setValue(warcHeaderContent)
      let whc = Buffer.from('\r\n' + swapper.template({
          version: '0.1',
          isPartOfV: 'chromeCrawled',
          warcInfoDescription: 'real chrome crawled',
          ua: UA
        }).s + '\r\n', 'utf8')
      let wh = Buffer.from(swapper.setValue(warcHeader).template({
        fileName: path.basename(outPath),
        now,
        len: whc.length,
        rid
      }).s, 'utf8')
      await writeWarcEntryBlock(warcOut, wh, whc, recordSeparator)
      let evaluatedPage
      let outlinks
      let evalFailed = false
      try {
        evaluatedPage = await Runtime.evaluate(pageEval)
      } catch (error) {
        console.error(error)
        evalFailed = true
        outlinks = ''
      }
      if (!evalFailed) {
        outlinks = evaluatedPage.result.value
      }
      let wmhc = Buffer.from(`\r\n${outlinks}\r\n`, 'utf8')
      let wmh = Buffer.from(swapper.setValue(warcMetadataHeader).template({
        targetURI: seedUrl,
        now,
        len: wmhc.length,
        concurrentTo: rid,
        rid: uuid()
      }).s, 'utf8')
      await writeWarcEntryBlock(warcOut, wmh, wmhc, recordSeparator)
      for (let {req, res} of iterateReqRes(pageReqs, pageRes)) {
        if (res) {
          let requestHttpString
          let responseHttpString
          if (res.response.requestHeadersText === undefined || res.response.requestHeadersText === null) {
            if (res.response.requestHeaders === undefined || res.response.requestHeaders === null) {
              let purl = URL.parse(req.request.url)
              requestHttpString = `${req.request.method} ${purl.path} HTTP/1.1\r\nHost: ${purl.host}\r\nConnection: keep-alive\r\nUser-Agent: ${UA}\r\nAccept: */*\r\n`
              requestHttpString += req.request.headers['Referer'] ? `Referer: ${req.request.headers['Referer']}\r\n` : `Referer: ${seedUrl}\r\n\r\n`
            } else {
              let requestHeaders = res.response.requestHeaders
              requestHttpString = `${requestHeaders[':method']} ${requestHeaders[':path']} HTTP/1.1\r\n`
              for (let [k, v] of Object.entries(requestHeaders)) {
                if (k[0] !== ':') {
                  requestHttpString += `${k}: ${v}\r\n`
                }
              }
              requestHttpString += '\r\n'
            }
          } else {
            requestHttpString = res.response.requestHeadersText
          }
          if (res.response.headersText === undefined || res.response.headersText === null) {
            responseHttpString = `HTTP/1.1 ${res.response.status} ${STATUS_CODES[res.response.status]}\r\n`
            for (let [k, v] of Object.entries(res.response.headers)) {
              if (k[0] !== ':') {
                responseHttpString += `${k}: ${v}\r\n`
              }
            }
            responseHttpString += '\r\n'
          } else {
            responseHttpString = res.response.headersText
          }
          swapper.setValue(warcRequestHeader)
          let reqHeadContentBuffer
          if (req.request.postData) {
            reqHeadContentBuffer = Buffer.from(`\r\n ${requestHttpString}${req.request.postData}\r\n`, 'utf8')
          } else {
            reqHeadContentBuffer = Buffer.from('\r\n' + requestHttpString, 'utf8')
          }
          let reqWHeader = swapper.template({
            targetURI: req.request.url,
            concurrentTo: rid,
            now,
            rid: uuid(),
            len: reqHeadContentBuffer.length
          }).s
          await writeWarcEntryBlock(warcOut, reqWHeader, reqHeadContentBuffer, recordSeparator)
          let resData
          try {
            let rbody = await Network.getResponseBody({requestId: req.requestId})
            if (rbody.base64Encoded) {
              resData = Buffer.from(rbody.body, 'base64')
            } else {
              resData = Buffer.from(rbody.body, 'utf8')
            }
          } catch (err) {
            resData = Buffer.from([])
            console.error(err)
            console.error(req.request.url)
          }
          let resHeaderContentBuffer = Buffer.from('\r\n' + responseHttpString, 'utf8')
          let respWHeader = swapper.setValue(warcResponseHeader).template({
            targetURI: req.request.url,
            now,
            rid: uuid(),
            len: resHeaderContentBuffer.length + resData.length
          }).s
          await writeWarcEntryBlock(warcOut, respWHeader, resHeaderContentBuffer, resData, '\r\n', recordSeparator)
        } else {
          console.log('boooo')
        }
      }
      warcOut.end()
    })
  })
}

