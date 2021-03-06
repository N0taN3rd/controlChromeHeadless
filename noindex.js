const CDP = require('chrome-remote-interface')
const remoteDom = require('remote-dom')
const Promise = require('bluebird')
// const R = require('ramda')
// const _ = require('lodash')
const util = require('util')
const runPromise = require('./lib/runPromise')
const URL = require('url')
const S = require('string')
const uuid = require('uuid/v1')
const fs = require('fs-extra')
const wf = require('./lib/warc/warcFields')
const {STATUS_CODES} = require('http')

// const fp =  require('lodash/fp/_baseConvert')(_, _)

// const inspect = R.compose(console.log, R.partialRight(util.inspect, [{depth: null, colors: true}]))
async function testDom (Dom, client) {
  let flat = await Dom.getFlattenedDocument({depth: -1, pierce: true})
  console.log(flat)
  client.close()
}

/*

 */
async function browsePage (client, tab) {
  const {Runtime, Console, Page, Network, DOM, Debugger, DOMDebugger} = client
  try {
    // await Runtime.evaluate({
    //   expression: `
    //    for (let it of Array.from(document.querySelectorAll('*')) {
    //       let listeners = getEventListeners(it)
    //       console.log(it);
    //       if ('click' in listeners) {
    //           it.click()
    //       }
    //     }
    //   `,
    //   includeCommandLineAPI: true,
    //   userGesture: true
    // })
    const window = await remoteDom.env(client)
    const selection = await window.document.querySelectorAll('*')
    const firstElement = selection[selection.length - 1]
    const html = await firstElement.outerHTML
    console.log('click' in firstElement)
    const localName = await firstElement.localName
    const prefix = await firstElement.prefix
    const innerHTML = await firstElement.innerHTML
    const classList = await firstElement.classList
    console.log(localName)
    console.log(innerHTML)
    console.log(classList)
    const clientRect = await firstElement.getBoundingClientRect()
    const top = await clientRect.top
    console.log(top)
    const matches = await firstElement.matches('a')
    console.log(matches)
    const tabIndex = firstElement.tabIndex = 4
    console.log(tabIndex)
    const title = await window.document.querySelector('title')
    const titleText = await title.text
    console.log(titleText)
    await firstElement.click()
  } catch (e) {
    console.error(e)
  } finally {
    if (tab) CDP.Close({id: tab.id})
    if (client) client.close()
  }
}

process.on('unhandledRejection', function (r) {
  console.error(r)
})

// Network.setMonitoringXHREnabled
async function runner (client) {
  process.on('exit', function () {
    if (client) client.close()
  })
  // extract domains
  const {Runtime, Console, Page, Network, DOM, Debugger, DOMDebugger} = client
  console.log(DOMDebugger)
  try {
    await Promise.all([
      Runtime.enable(),
      Debugger.enable(),
      DOM.enable(),
      Console.enable(),
      Page.enable()
    ])
    Page.loadEventFired(function () {
      console.log('loaded')
      browsePage(client).then(() => {

      }).catch(error => {
        console.error(error)
        client.close()
      })
    })
    await Page.navigate({url: 'https://chromium.org'})
    Runtime.consoleAPICalled(function ({args}) {
      console.log(args)
    })
  } catch (error) {
    console.error(error)
    if (client) client.close()
  }

  // // setup handlers
  // Network.requestWillBeSent((params) => {
  //   console.log(params.request.url)
  // })
  // Page.loadEventFired(() => {
  //   // client.close()
  //   testDom(DOM, client).then(() => {
  //     console.log('done')
  //   }).catch(err => {
  //     console.error(err)
  //     client.close()
  //   })
  // })
  // // enable events then start!
  // Promise.all([
  //   Network.enable(),
  //   Page.enable(),
  //   DOM.enable(),
  // ]).then(() => {
  //   return Page.navigate({ url: 'https://github.com' })
  // }).catch((err) => {
  //   console.error(err)
  //   client.close()
  // })
  // client.close()
}

function _getClickerIds () {
  let ids = []
  let c = 0
  for (let it of document.querySelectorAll('*')) {
    let listeners = getEventListeners(it)
    if ('click' in listeners) {
      if (it.id) {
        ids.push(it.id)
      } else {
        it.id = `_myId${c++}`
        ids.push(it.id)
      }
    }
  }
  return ids
}

const getClickerIds = `(${_getClickerIds.toString()})()`

// const bodyFinder = R.find(R.propEq('localName', 'body'))

function getBody (dom) {
  if (dom.root.children.length > 1) {
    let HTML = dom.root.children[1]
    if (HTML.children.length > 1) {
      return HTML.children[1]
    }
  }
}

async function blastClick (DOM, DOMDebugger, Runtime) {
  console.time('getDocument-Flatten')
  let haveClickListeners = []
  let noClickListeners = []
  try {
    let flat = await DOM.getFlattenedDocument({depth: -1})
    let len = flat.nodes.length, i = 0
    for (; i < len; ++i) {
      let elm = flat.nodes[i]
      let resolvedNode, maybeListeners
      try {
        resolvedNode = await DOM.resolveNode({nodeId: elm.nodeId})
        maybeListeners = await DOMDebugger.getEventListeners({objectId: resolvedNode.object.objectId})
        console.log(maybeListeners)
      } catch (error) {
        console.error(error)
        continue
      }
      let evLen = maybeListeners.listeners.length
      if (evLen > 0) {
        // console.log(elm.localName, maybeListeners)
        let j = 0
        let found = false
        for (; j < evLen; ++j) {
          if (maybeListeners.listeners[j].type === 'click') {
            found = true
            break
          }
        }
        if (found) {
          haveClickListeners.push({elem: elm, remoteElem: resolvedNode})
        } else {
          noClickListeners.push(resolvedNode.object.objectId)
        }
      } else {
        noClickListeners.push(resolvedNode.object.objectId)
      }
    }
    // console.log(haveClickListeners.length, noClickListeners.length)
    i = 0
    len = noClickListeners.length
    let releaseRemoteObjects = []
    for (; i < len; ++i) {
      releaseRemoteObjects.push(Runtime.releaseObject({objectId: noClickListeners[i]}))
    }
    let clickP = []
    i = haveClickListeners.length - 1
    len = 0
    for (; i >= len; --i) {
      // console.log(haveClickListeners[i])
      let nn = haveClickListeners[i].elem.nodeName
      if (nn === '#document' || nn === 'BODY') {
        continue
      }
      clickP.push(Runtime.callFunctionOn({
        objectId: haveClickListeners[i].remoteElem.object.objectId,
        silent: true,
        functionDeclaration: `function () {
                this.click();
        }`
      }))
    }
    try {
      await Promise.all(clickP)
      // console.log('after call')
    } catch (error) {
      console.error(error)
      // console.error(ec)
    }
    try {
      await Promise.all(releaseRemoteObjects)
    } catch (error) {
      console.error(error)
    }
    /*
     await Runtime.callFunctionOn({
     objectId,
     functionDeclaration: `function () {
     return this.getBoundingClientRect()
     }`
     })
     */
    // dom = await DOM.getDocument({depth: -1, pierce: true})
    // let body = getBody(dom)
    // if (body) {
    //   resolvedNode = await DOM.resolveNode({nodeId: body.nodeId})
    //   let listeners = await DOMDebugger.getEventListeners({objectId: resolvedNode.object.objectId, depth: -1})
    //   console.log(listeners)
    // }
    // if (dom.root.children.length > 1) {
    //   let HTML = dom.root.children[1]
    //   if (HTML.children.length > 1) {
    //     let body = HTML.children[1]
    //     console.log(body)
    //   }
    //   // console.log(HTML.children)
    // }
    // console.log(flat)
    console.log()
    console.timeEnd('getDocument-Flatten')
    // console.log(bodyFinder(dom.root.children[1].children))
    // let flat = await DOM.getFlattenedDocument({depth: -1, pierce: true})
    // console.log(flat)
    // resolvedNode = await DOM.resolveNode({nodeId})
  } catch (error) {
    console.error(error)
  }
}

async function downAcrossClickSweep (Page, Input) {
  let vv
  try {
    let lm = await Page.getLayoutMetrics()
    console.log(lm)
    vv = lm.visualViewport
    // let windowBounds = await Browser.getWindowBounds()
  } catch (error) {
    console.error(error)
  }
  let ch = vv.clientHeight, cw = vv.clientWidth
  for (let x = 0; x < cw; x += 10) {
    for (let y = 0; y < ch; y += 5) {
      try {
        await Input.dispatchMouseEvent({x, y, type: 'mousePressed', button: 'left', clickCount: 1})
        await Input.dispatchMouseEvent({x, y, type: 'mouseReleased', button: 'left', clickCount: 1})
        console.log(`(${x},${y})`)
      } catch (error) {
        console.error(error)
      }
    }
  }
}

function maybeNavigate (Page) {
  return new Promise((resolve, reject) => {
    let timeOut = setTimeout(() => {
      resolve()
    }, 1000)
    Page.navigationRequested((args) => {
      clearTimeout(timeOut)
      Page.processNavigation({navigationId: args.navigationId, response: 'Cancel'}, (err, response) => {
        console.log(args)
        resolve()
      })
    })
  })
}

function writeWarcEntry (writeStream, data) {
  return new Promise((resolve, reject) => {
    writeStream.write(data, 'utf8', () => {
      resolve()
    })
  })
}

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

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.36 Safari/537.36'

const getHost = (headers, notFound) => {
  let host = headers['Host'] || headers['host'] || headers['HOST']
  if (host) {
    return `Host: ${host}`
  }
  return notFound
}

/*
 GET /k/en/14.pages_profile.en.33821097e57430b07e1f.js HTTP/1.1
 Host: abs.twimg.com
 Connection: keep-alive
 User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.36 Safari/537.36
 Accept: star/star
 Referer: https://twitter.com/WebSciDL
 Accept-Encoding: gzip, deflate, br
 Accept-Language: en-US,en;q=0.8
 */

function getHttpString (purl, method, headers) {
  let requestHttpString = `${method} ${purl.path} HTTP/1.0\r\nHost: ${purl.host}\r\nConnection: keep-alive\r\n${UA}\r\n`
  requestHttpString += headers['User-Agent'] ? `User-Agent: ${headers['User-Agent']}\r\n` : `${UA}\r\n`
}

const swapper = S('')

function isDefined (what) {
  return what !== null || what !== undefined
}

function go () {
  CDP(async client => {
    process.on('exit', function () {
      if (client) client.close()
    })
    const {Runtime, Console, Page, Network, DOM, Debugger, DOMDebugger, Input} = client
    // setup handlers
    // enable events then start!
    // console.log(Number.MAX_SAFE_INTEGER)'
    // 9,007,199,254,740,991
    // 700000000
    try {
      await Promise.all([
        Runtime.enable(),
        Debugger.enable(),
        DOM.enable(),
        Console.enable(),
        Page.enable(),
        Network.enable()
      ])
    } catch (err) {
      console.error(err)
    }
    let pageGets = new Map()
    let pageReqs = new Map()
    let pageRes = new Map()
    // Page.navigate({url: 'https://reacttraining.com/react-router/web/guides/quick-start'}, (...args) => {
    //   console.log('page navigate', ...args)
    // })
    let seedUrl = 'https://reacttraining.com/react-router/web/guides/quick-start' // 'http://web.archive.org/web/20170515050340/http://www.foodnetwork.com/'
    Page.navigate({url: seedUrl}, (...args) => {
      console.log('page navigate', ...args)
    })
    // Array.from(document.links).map(it => it.href)
    let capture = true
    Page.loadEventFired(async (info) => {
      await Page.setControlNavigations({enabled: true})
      // await blastClick(DOM,DOMDebugger,Runtime)
      let lm, vv
      try {
        lm = await Page.getLayoutMetrics()
        vv = lm.visualViewport
        // let windowBounds = await Browser.getWindowBounds()
      } catch (error) {
        console.error(error)
      }
      let ch = vv.clientHeight, cw = vv.clientWidth
      for (let x = 0; x < cw; x += 15) {
        for (let y = 0; y < ch; y += 5) {
          try {
            await Input.dispatchMouseEvent({x, y, type: 'mousePressed', button: 'left', clickCount: 1})
            await Input.dispatchMouseEvent({x, y, type: 'mouseReleased', button: 'left', clickCount: 1})
            console.log(`(${x},${y})`)
          } catch (error) {
            console.error(error)
          }
        }

        // await maybeNavigate(Page)
        console.log(x)
      }
    })
    // Network.requestWillBeSent((info) => {
    //   console.log(info.request.url)
    // })
    // Network.responseReceived((info) => {
    //   console.log(info.request.url)
    // })

    Page.navigationRequested((args) => {
      Page.processNavigation({navigationId: args.navigationId, response: 'Cancel'}, (err, response) => {
        console.log(err, response)
      })
    })

    // getDocument-BodyFinder 31.742ms

    // let clickerIds
    // try {
    //   clickerIds = await Runtime.evaluate({
    //     expression: getClickerIds,
    //     includeCommandLineAPI: true,
    //     generatePreview: true,
    //     returnByValue: true
    //   })
    //   console.log(clickerIds)
    // } catch (error) {
    //   console.error(error)
    // }
    // await client.close();
  }).on('error', (err) => {
    // cannot connect to the remote endpoint
    console.error(err)
  })
}

go()
