/**
 * @extends Map
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

  startCapturing (clear = false) {
    if (clear) {
      this.clear()
    }
    this._capture = true
  }

  stopCapturing () {
    this._capture = false
  }

  _requestWillBeSent (info) {
    if (this._capture) {
      let captured = {
        requestId: info.requestId,
        url: info.request.url,
        headers: info.request.headers,
        method: info.request.method,
      }

      if (info.redirectResponse !== undefined && info.redirectResponse !== null) {
        captured.redirectResponse = info.redirectResponse
      }

      if (info.request.postData !== undefined && info.request.postData !== null) {
        captured.postData = info.request.postData
      }

      this._set(info.requestId, captured)
    }
  }

  _responseReceived (info) {
    if (this._capture) {
      if (!this.has(info.requestId)) {
        console.log('booooo no have matching request for', info.requestId)
        this._set(info.requestId, {
          res: info.response
        })
      } else {
        this.get(info.requestId).res = info.response
      }
    }
  }
}

module.exports = RequestMonitor
