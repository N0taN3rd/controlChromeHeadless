const fs = require('fs-extra')
const Promise = require('bluebird')
const Path = require('path')
const uuid = require('uuid/v1')
const S = require('string')
const moment = require('moment')
const EventEmitter = require('eventemitter3')
const {
  warcHeader,
  warcHeaderContent,
  warcRequestHeader,
  warcResponseHeader,
  warcMetadataHeader,
  recordSeparator,
  CRLF
} = require('./warcFields')

class WarcWriter extends EventEmitter {
  constructor () {
    super()
    this._warcOutStream = null
    this._lastError = null
    this._onFinish = this._onFinish.bind(this)
    this._onError = this._onError.bind(this)
    this._writeQ = []
    this._swapper = S('')
    this._rid = null
    this._now = null
    this._fileName = null
  }

  initWARC (warcPath, appending = false) {
    if (appending) {
      this._warcOutStream = fs.createWriteStream(warcPath, {flags: 'a'})
    } else {
      this._warcOutStream = fs.createWriteStream(warcPath)
    }
    this._warcOutStream.on('finish', this._onFinish)
    this._warcOutStream.on('error', this._onError)
    let now = new Date().toISOString()
    this._now = now.substr(0, now.indexOf('.')) + 'Z'
    this._rid = uuid()
    this._fileName = Path.basename(warcPath)
  }

  warcHeader (version, isPartOfV, warcInfoDescription, ua) {
    this._swapper.setValue(warcHeaderContent)
    let whct = this._swapper.template({version, isPartOfV, warcInfoDescription, ua}).s
    let whc = Buffer.from(`${CRLF}${whct}${CRLF}`, 'utf8')
    let wh = Buffer.from(this._swapper.setValue(warcHeader).template({
      fileName: this._fileName,
      now: this._now,
      len: whc.length,
      rid: this._rid
    }).s, 'utf8')
  }

  _onFinish () {
    if (this._lastError) {
      this.emit('finished', this._lastError)
    } else {
      this.emit('finished')
    }
    this._lastError = null
    this._warcOutStream = null
    this._rid = null
    this._now = null
    this._fileName = null
  }

  _onError (err) {
    this._lastError = err
    this.emit('error', err)
  }

}