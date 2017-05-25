class CapturedRequest {
  constructor (req) {
    this.requestId = req.requestId
    this.url = req.request.url
    this.headers = req.request.headers
    this.method = req.request.method
    if (req.request.redirectResponse !== undefined && req.request.redirectResponse !== null) {
      this.redirectResponse = req.request.redirectResponse
    }
    if (req.request.postData !== undefined && req.request.postData !== null) {
      this.postData = req.request.postData
    }
  }

  addResponse (res) {
    this.resStatus = res.response.status
    this.resStatusText = res.response.statusText
    this.resHeaders = res.response.headers
    if (res.response.headersText !== undefined && res.response.headersText !== null) {
      this.resHeadersText = res.response.headersText
    }
    if (res.response.requestHeaders !== undefined && res.response.requestHeaders !== null) {
      this.resRequestHeaders = res.response.headersText
    }
    if (res.response.requestHeadersText !== undefined && res.response.requestHeadersText !== null) {
      this.resRequestHeadersText = res.response.requestHeadersText
    }
    if (res.response.protocol !== undefined && res.response.protocol !== null) {
      this.resProtocol = res.response.protocol
    }
  }
}

module.exports = CapturedRequest
