const CDP = require('chrome-remote-interface')
const EventEmitter = require('eventemitter3')

module.exports = class RemoteChrome extends EventEmitter {
  constructor () {
    super()
    this._connected = this._connected.bind(this)
    this.init = this.init.bind(this)
    this._client = null
    this._autoClose = false
  }

  init () {
    CDP(this._connected)
      .on('error', (err) => {
        this.emit('error', err)
      })
      .on('disconnect', () => {
        this.emit('disconnected')
      })
  }

  shutdown (...args) {
    return this._client.close(...args)
  }

  _connected (client) {
    this._client = client
    this.emit('connected', client)
  }

  _enableAutoClose () {
    if (!this._autoClose) {
      process.on('exit', () => {
        if (this._client) {
          this._client.close()
        }
      })
    }
    this._autoClose = true
    return this
  }

  static withAutoClose () {
    return new RemoteChrome()._enableAutoClose()
  }

  static Protocol (...args) {
    return CDP.Protocol(...args)
  }

  static List (...args) {
    return CDP.List(...args)
  }

  static New (...args) {
    return CDP.New(...args)
  }

  static Activate (...args) {
    return CDP.Activate(...args)
  }

  static Close (...args) {
    return CDP.Close(...args)
  }

  static Version (...args) {
    return CDP.Version(...args)
  }
}
/*
 module.exports.listTabs = devtools.List;
 module.exports.spawnTab = devtools.New;
 module.exports.closeTab = devtools.Close;

 module.exports.Protocol = devtools.Protocol;
 module.exports.List = devtools.List;
 module.exports.New = devtools.New;
 module.exports.Activate = devtools.Activate;
 module.exports.Close = devtools.Close;
 module.exports.Version = devtools.Version;
 */
