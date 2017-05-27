const CDP = require('chrome-remote-interface')
const EventEmitter = require('eventemitter3')
const Promise = require('bluebird')
const RequestMonitor = require('../requestMonitor')
const helpers = require('./helpers')

const defaultOpts = {
  connectOpts: {
    host: 'localhost',
    port: 9222,
  },
  timeOuts: {
    navigationTimeout: 8000,
    loadTimeout: 7000
  }
}

/*

 Map.prototype.entries = function() {};
 Map.prototype.forEach = function(callbackfn,thisArg) {};
 Map.prototype.get = function(key) {};
 Map.prototype.has = function(key) {};
 Map.prototype.keys = function() {};
 Map.prototype.set = function(key,value) {};
 Map.prototype.values = function() {};
 */

class Crawler extends EventEmitter {
  constructor (options = defaultOpts) {
    super()
    options.connectOpts = options.connectOpts || defaultOpts.connectOpts
    options.timeOuts = options.timeOuts || defaultOpts.timeOuts
    this.options = options
    this._client = null
    this._autoClose = false
    this.requestMonitor = null
    this._currentUrl = null
    this._navTimeout = null
    this.init = this.init.bind(this)
    this._close = this._close.bind(this)
    this._navTimedOut = this._navTimedOut.bind(this)
    this._connected = this._connected.bind(this)
    this._didNavigate = this._didNavigate.bind(this)
    this._pageLoaded = this._pageLoaded.bind(this)
  }

  init () {
    CDP(this.options.connectOpts, this._connected)
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

  async _connected (client) {
    this._client = client
    let wasError = false
    try {
      await Promise.all([
        this._client.Runtime.enable(),
        this._client.DOM.enable(),
        this._client.Page.enable(),
        this._client.Network.enable()
      ])
    } catch (error) {
      wasError = true
      this.emit('error', error)
    }

    if (await this._client.Network.canClearBrowserCache()) {
      await this._client.Network.clearBrowserCache()
    }

    if (!wasError) {
      await this._client.Page.addScriptToEvaluateOnLoad(helpers.noNaughtyJs)
      this.requestMonitor = new RequestMonitor(this._client.Network)
      this._client.Page.loadEventFired(this._pageLoaded)
      this.emit('connected')
    }
  }

  navigate (url) {
    this._currentUrl = url
    this.requestMonitor.startCapturing(true)
    this._client.Page.navigate({url}, this._didNavigate)
    if (this.options.timeOuts.navigationTimeout) {
      this._navTimeout = setTimeout(this._navTimedOut, this.options.timeOuts.navigationTimeout)
    }
  }

  [Symbol.iterator] () {
    return this.requestMonitor.values()
  }

  _navTimedOut () {
    if (this._navTimeout) {
      clearTimeout(this._navTimeout)
      this._navTimeout = null
    }
    this._navTimeout = null
    this.emit('navigation-timedout', this._currentUrl)
  }

  _didNavigate (...args) {
    this.emit('navigated', this._currentUrl)
  }

  async _pageLoaded (info) {
    if (this._navTimeout) {
      clearTimeout(this._navTimeout)
      this._navTimeout = null
    }
    if (this.options.timeOuts.loadTimeout) {
      await Promise.delay(this.options.timeOuts.loadTimeout)
    }
    this.requestMonitor.stopCapturing()
    this.emit('page-loaded', info)
  }

  _enableAutoClose () {
    if (!this._autoClose) {
      process.on('exit', this._close)
    }
    this._autoClose = true
    return this
  }

  _close () {
    if (this._client) {
      return this._client.close()
    }
  }

  static withAutoClose (options = defaultOpts) {
    return new Crawler(options)._enableAutoClose()
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

module.exports = Crawler
