const CapturedRequest = require('./capturedRequest')

/**
 * @desc
 * An Exotic Class :)
 */
class RequestMonitor extends Map {
  constructor (network) {
    super()
    this._capture = true
    this._requestWillBeSent = this._requestWillBeSent.bind(this)
    this._responseReceived = this._responseReceived.bind(this)
    this._set = this.set.bind(this)
    this.set = () => {
      console.log('you fell for the trap!!! You cant add values to me, only I can :)')
    }
    network.requestWillBeSent(this._requestWillBeSent)
    network.responseReceived(this._responseReceived)
  }

  startCapturing () {
    this._capture = true
  }

  stopCapturing () {
    this._capture = false
  }

  _requestWillBeSent (info) {
    if (this._capture) {
      this._set(info.requestId, new CapturedRequest(info))
    }
  }

  _responseReceived (info) {
    if (this._capture) {
      if (!this.has(info.requestId)) {
        console.log('booooo no have matching request for', info.requestId)
      }
      this.get(info.requestId).addResponse(info)
    }
  }
}

module.exports = RequestMonitor
