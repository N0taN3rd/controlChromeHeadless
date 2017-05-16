class WarcWriter {
  constructor () {
    this.warcOutStream = null
  }

  onError (fun) {
    if (this.warcOutStream) {
      this.warcOutStream.on('error',fun)
    }
  }

  done () {
    this.warcOutStream.end()
  }

  onFinish (fun) {
    if (this.warcOutStream) {
      this.warcOutStream.on('finish',fun)
    }
  }


}