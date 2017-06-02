const chalk = require('chalk')
const PrettyError = require('pretty-error')
const pe = new PrettyError()

module.exports = {
  yellow (...args) {
    console.log(chalk.yellow(...args))
  },
  green (...args) {
    console.log(chalk.green(...args))
  },
  red (...args) {
    console.log(chalk.red(...args))
  },
  bred (...args) {
    console.log(chalk.bold.red(...args))
  },
  blue (...args) {
    console.log(chalk.blue(...args))
  },
  cyan (...args) {
    console.log(chalk.cyan(...args))
  },
  magenta (...args) {
    console.log(chalk.magenta(...args))
  },
  error (m, error) {
    console.log(chalk.bold.red(m))
    console.log(pe.render(error))
  },
  boldBlueGreen (bb, ...rest) {
    console.log(chalk.bold.blue(bb), chalk.green(...rest))
  },
  crawlerOpt(f, ...r) {
    console.log(chalk.bold.blue(f), chalk.bold.yellow(...r))
  },
  configError(m,config) {
    console.log(chalk.bold.red(m))
    console.log(chalk.red(JSON.stringify(config,null,'\t')))
  }
}