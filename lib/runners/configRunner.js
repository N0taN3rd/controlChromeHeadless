const R = require('ramda')
const path = require('path')
const fs = require('fs-extra')
const prettyMs = require('pretty-ms')
const runPromise = require('../runPromise')
const cp = require('../utils/colorPrinters')
const defaults = require('../defaults')
const Crawler = require('../crawler')
const warcNamePerURL = require('../utils/urlUtils').warcNamePerURL

module.exports = R.compose(runPromise, async configPath => {
  const conf = await fs.readJson(configPath)
  let mode = conf.mode || 'single-page'
  let seeds = conf.seeds
  let warc = conf.warc || defaults.defaultOpts.warc
  warc.naming = warc.naming || defaults.defaultOpts.warc.naming
  warc.output = warc.output || defaults.defaultOpts.warc.output
  let connectOpts = conf.connect || defaults.defaultOpts.connectOpts
  connectOpts.host = conf.connect.host || defaults.defaultOpts.connectOpts.host
  connectOpts.port = conf.connect.port || defaults.defaultOpts.connectOpts.port
  let timeouts = conf.timeouts || defaults.defaultOpts.timeOuts
  timeouts.navigationTimeout = conf.timeouts.navigationTimeout || defaults.defaultOpts.timeOuts.navigationTimeout
  timeouts.loadTimeout = conf.timeouts.loadTimeout || defaults.defaultOpts.timeOuts.loadTimeout
  cp.crawlerOpt('Crawler Operating In', mode, 'mode')
  if (R.isNil(seeds)) {
    cp.configError('No Seeds Were Provided Via The Config File', conf)
    cp.bred('Crawler Shutting Down. GoodBy')
    process.exit(0)
  }
  if (Array.isArray(seeds)) {
    cp.crawlerOpt('Crawler Will Be Preserving', `${seeds.length} Seeds`)
  } else {
    cp.crawlerOpt('Crawler Will Be Preserving', seeds)
    seeds = [seeds]
  }
  if (warc.naming.toLowerCase() === 'url') {
    cp.crawlerOpt('Crawler Will Be Generating WARC Files Using', 'the filenamified url')
  } else {
    cp.crawlerOpt('Crawler Will Be Generating WARC Files Named', warc.naming)
  }
  cp.crawlerOpt('Crawler Generated WARCs Will Be Placed At', warc.output)
  cp.crawlerOpt('Crawler Is Connecting To Chrome On Host', connectOpts.host)
  cp.crawlerOpt('Crawler Is Connecting To Chrome On Port', connectOpts.port)
  cp.crawlerOpt('Crawler Will Be Waiting At Maximum For Navigation To Happen For', prettyMs(timeouts.navigationTimeout))
  cp.crawlerOpt('Crawler Will Be Waiting At Maximum For Page Load To Happen For', prettyMs(timeouts.loadTimeout))

  const crawler = Crawler.withAutoClose()

  const warcFilePath = warcNamePerURL(warc.output)
  let seedUrl = seeds.shift()

  crawler.on('error', err => {
    cp.error('Crawler Encountered A Random Error', err.err)
    if (err.type === 'warc-gen') {
      if (seeds.length === 0) {
        cp.cyan('No More Seeds\nCrawler Shutting Down\nGoodBy')
      } else {
        cp.cyan(`Crawler Has ${seeds.length} Seeds Left To Crawl`)
        seedUrl = seeds.shift()
        crawler.navigate(seedUrl)
      }
    }
  })

  crawler.on('disconnect', () => {
    cp.bred('Crawlers Connection To The Remote Browser Has Closed')
  })

  crawler.on('navigation-timedout', url => {
    cp.bred(`Crawler Attempted To Navigate To ${url}\nBut The Navigation Wait Time Of ${prettyMs(timeouts.navigationTimeout)} Was Exceeded`)
  })

  crawler.on('navigated', navigatedTo => {
    cp.cyan(`Crawler Navigated To ${navigatedTo}`)
  })


  crawler.on('connected', () => {
    cp.cyan(`Crawler Navigating To ${seedUrl}`)
    crawler.navigate(seedUrl)
  })

  crawler.on('warc-gen-finished', async () => {
    cp.cyan('Crawler Generated WARC')
    if (seeds.length === 0) {
      cp.cyan('No More Seeds\nCrawler Shutting Down\nGoodBy')
      await crawler.shutdown()
    } else {
      cp.cyan(`Crawler Has ${seeds.length} Seeds Left To Crawl`)
      seedUrl = seeds.shift()
      crawler.navigate(seedUrl)
    }
  })

  crawler.on('page-loaded', async loadedInfo => {
    cp.cyan(`${seedUrl} loaded \nCrawler Generating WARC`)
    crawler.initWARC(warcFilePath(seedUrl))
    let outlinks = await crawler.getOutLinkMetadata()
    try {
      await crawler.genWarc({outlinks})
    } catch (error) {
      cp.error('Crawler Encountered An Error While Generating The WARC', error)
      crawler.emit('error', {type: 'warc-gen', err: error})
    }
  })

  crawler.init()

})