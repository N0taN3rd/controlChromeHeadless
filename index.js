const CDP = require('chrome-remote-interface')
const remoteDom = require('remote-dom')
const Promise = require('bluebird')
const R = require('ramda')
const util = require('util')
const runPromise = require('./lib/runPromise')


const inspect = R.compose(console.log, R.partialRight(util.inspect, [{ depth: null, colors: true }]))
async function testDom (Dom, client) {
  let flat = await Dom.getFlattenedDocument({ depth: -1, pierce: true })
  console.log(flat)
  client.close()
}

/*

 */
async function browsePage (client, tab) {
  const {Runtime, Console, Page,Network, DOM,Debugger,DOMDebugger} = client
  try {
    await Runtime.evaluate({
      expression: `
       for (let it of Array.from(document.querySelectorAll('*')) {
          let listeners = getEventListeners(it)
          if ('click' in listeners) {
              it.click()
          }
        }
      `,
      includeCommandLineAPI: true,
      userGesture: true
    })
    // const window = await remoteDom.env(client)
    // const selection = await window.document.querySelectorAll('*')
    // for (const element of selection) {
    //   if ('click' in element) {
    //     await element.click()
    //   }
    //   //await element.remove()
    // }
    // const firstElement = selection[selection.length - 1]
    // const html = await firstElement.outerHTML
    // console.log('click' in firstElement)
    // const localName = await firstElement.localName
    // const prefix = await firstElement.prefix
    // const innerHTML = await firstElement.innerHTML
    // const classList = await firstElement.classList
    // console.log(localName)
    // console.log(innerHTML)
    // console.log(classList)
    // const clientRect = await firstElement.getBoundingClientRect()
    // const top = await clientRect.top
    // console.log(top)
    // const matches = await firstElement.matches('a')
    // console.log(matches)
    // const tabIndex = firstElement.tabIndex = 4
    // console.log(tabIndex)
    // const title = await window.document.querySelector('title')
    // const titleText = await title.text
    // console.log(titleText)
    // await firstElement.click()
  } catch (e){
    console.error(e)
  } finally {
    if (tab) CDP.Close({id: tab.id})
    if (client) client.close()
  }
}

process.on('unhandledRejection', function (r) {
  console.error(r)
})

async function runner (client) {
  process.on('exit', function () {
    if (client) client.close()
  })
  // extract domains
  const {Runtime, Console, Page,Network, DOM,Debugger,DOMDebugger} = client

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
    await Page.navigate({ url: 'https://reacttraining.com/react-router/web/guides/quick-start' })
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

CDP(R.compose(runPromise, runner)).on('error', (err) => {
  // cannot connect to the remote endpoint
  console.error(err)
})
