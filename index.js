const CDP = require('chrome-remote-interface')
const remoteDom = require('remote-dom')
const Promise = require('bluebird')
// const R = require('ramda')
// const _ = require('lodash')
const util = require('util')
const runPromise = require('./lib/runPromise')
const URL = require('url')

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

//Network.setMonitoringXHREnabled
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
      Page.enable(),
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

function go () {
  CDP(async client => {
    process.on('exit', function () {
      if (client) client.close()
    })
    const {Runtime, Console, Page, Network, DOM, Debugger, DOMDebugger, Input} = client
    // setup handlers
    // enable events then start!
    try {
      await Promise.all([
        Runtime.enable(),
        Debugger.enable(),
        DOM.enable(),
        Console.enable(),
        Page.enable(),
      ])

      await Page.navigate({url: 'https://reacttraining.com/react-router/web/guides/quick-start'});
      await Page.setControlNavigations({enabled: true})
      await Page.loadEventFired()

    } catch (err) {
      console.error(err);
    }
    Runtime.consoleAPICalled(function ({args}) {
      console.log(args)
    })
    DOM.documentUpdated((...args) => {
      console.log(...args)
    })

    // Page.navigationRequested((args) => {
    //   Page.processNavigation({navigationId: args.navigationId, response: 'Cancel'}, (err, response) => {
    //     console.log(err, response)
    //   })
    // })
    let vv
    try {
      let lm = await Page.getLayoutMetrics()
      vv = lm.visualViewport
      // let windowBounds = await Browser.getWindowBounds()
    } catch (error) {
      console.error(error)
    }
    let ch = vv.clientHeight, cw = vv.clientWidth
    for (let x = 0; x < cw; x += 10) {
      for (let y = 0; y < ch; y += 1) {
        try {
          await Input.dispatchMouseEvent({x, y, type: 'mousePressed', button: 'left', clickCount: 1})
          await Input.dispatchMouseEvent({x, y, type: 'mouseReleased', button: 'left', clickCount: 1})
          // console.log(`(${x},${y})`)
        } catch (error) {
          console.error(error)
        }
      }

      await maybeNavigate(Page)
      console.log(x)
    }

    //getDocument-BodyFinder 31.742ms

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
    await client.close();
  }).on('error', (err) => {
    // cannot connect to the remote endpoint
    console.error(err)
  })
}

// console.log(URL.parse('https://reacttraining.com/react-router/web/guides/quick-start'))
go()