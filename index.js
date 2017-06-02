const program = require('commander')
const R = require('ramda')
const configRunner = require('./lib/runners').configRunner
const cp = require('./lib/utils/colorPrinters')

program
  .version('1.0.0', '-v, --version')
  .option('-c, --config <path-to-config.json>', 'Launch A Crawl From A Config')

program.parse(process.argv)
if (program.rawArgs.slice(2).length === 0) {
  cp.green(program.helpInformation())
  // process.exit(1)
} else {
  if (!R.isNil(program.config)) {
    cp.crawlerOpt('Running Crawl From Config File', program.config)
    configRunner(program.config)
  } else {
    cp.bred('Config argument was not existence')
  }
}
