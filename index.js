const program = require('commander')
const chalk = require('chalk')
const log = console.log

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

program
// .usage('[options] [command|URL]')
  .version('1.0.0', '-v, --version')
  .option('-H, --host [host]', 'Chrome Debugging Protocol host. Defaults to localhost', 'localhost')
  .option('-p, --port [port]', 'Chrome Debugging Protocol port. Defaults to 9222', handlePort, 9222)
  .option('-t, --timeout [ms]', 'Time to wait for navigation to complete before giving up with a URL', parseInt)
  .option('-a, --agent [agent]', 'Chrome user agent override')
  .option('-n, --name [warcFileName]', 'The name of the warc. Defaults to seedURL-datetime, the seed URL will be filenamified')
  .option('-o, --out <where>', 'the directory where to create the warc in', handleOutDir, cwd)

// program.missingArgument = name => {
//   console.error("  error: missing required argument `%s'", name)
//   program.outputHelp(chalk.green)
//   process.exit(1)
// }

program
  .command('single-page <url> [urls.....]')
  .alias('sp')
  .description('preserve a single web page')
  .action((url, varArgs, options) => {
    options.port = options.port || options.parent.port
    console.log(options.port)
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