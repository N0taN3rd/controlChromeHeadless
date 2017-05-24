const program = require('commander')
const chalk = require('chalk')
const _ = require('lodash')
const path = require('path')

const cwd = process.cwd()

/**
 * seed,url,port,host,outDir,allLinks,
 */

/*
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
 outPath = path.join(outDir, `${file
 */

function handlePort (supplied, defaultValue) {
  if (supplied === undefined) {
    return defaultValue
  } else if (typeof supplied === 'string') {
    return parseInt(supplied)
  } else {
    return supplied
  }
}

function handleOutDir (supplied, defaultValue) {
  if (supplied === undefined) {
    return defaultValue
  } else {
    return supplied
  }
}

function normalizeCrawlOptions (options) {
  options.host = options.host || options.parent.host
  options.port = options.port || options.parent.port
  options.warcName = options.warcName || options.parent.warcName
  options.outputDirectory = options.outputDirectory || options.parent.outputDirectory
}

program
  .version('1.0.0', '-v, --version')

program
  .command('single-page <url> [urls.....]', 'Preserve a single page or a series of pages')
  .alias('sp')
  .option('-H, --host [host]', 'Chrome Debugging Protocol host. Defaults to localhost', 'localhost')
  .option('-p, --port [port]', 'Chrome Debugging Protocol port. Defaults to 9222', handlePort, 9222)
  .option('-n, --navigation-timeout [ms]', 'Time to wait in milliseconds for navigation to complete before giving up on a URL', parseInt)
  .option('-l, --load-timeout [ms]', 'Time to wait in milliseconds for the page to load before WARC generation begins', parseInt)
  .option('-U, --agent [agent]', 'Override the default Chrome User-Agent')
  .option('-w, --warc-name [warcFileName]', 'The name of the WARC. Defaults to seedURL-datetime, the seed URL will be filenamified')
  .option('-o, --output-directory [where]', 'The directory where to create the WARC in, defaults to current working directory', handleOutDir, cwd)
  .action((url, varArgs, options) => {
    let multiple
    if (options) {
      // var args

    } else {
      options = varArgs
    }
    normalizeCrawlOptions(options)
    console.log(options)
  })

program.parse(process.argv)
// console.log(program.rawArgs)
if (program.rawArgs.slice(2).length === 0) {
  program.help()
  // process.exit(1)
}

// console.log(program)
// if (program.rawArgs.slice(2).length === 0) {
//   program.outputHelp(chalk.green)
//   process.exit(1)
// } else {
//   console.log(program)
//   // console.log(parseInt('9222'))
//   // console.log(typeof program.port)
//   // console.log(chalk.red('host %s, port %j'), program.host, program.port)
// }

// program
//   .usage('[options] URL...')
//   .option('-t, --host <host>', 'Chrome Debugging Protocol host')
//   .option('-p, --port <port>', 'Chrome Debugging Protocol port')
//   .option('-x, --width <dip>', 'frame width in DIP')
//   .option('-y, --height <dip>', 'frame height in DIP')
//   .option('-o, --output <file>', 'write to file instead of stdout')
//   .option('-c, --content', 'also capture the requests body')
//   .option('-a, --agent <agent>', 'user agent override')
//   .option('-g, --grace <ms>', 'time to wait after the load event')
//   .option('-l, --parallel <n>', 'load <n> URLs in parallel')
//   .parse(process.argv);
//
// if (program.args.length === 0) {
//   program.outputHelp();
//   process.exit(1);
// }