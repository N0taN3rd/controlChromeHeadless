# WIP

Iv [origin-stamped](https://app.originstamp.org/home) this :feelsgood:

Remember Open Source and Comunity Envolvement!

# Usage

There are two shell scripts provided to help you use the project at the current stage.

### run-chrome.sh   
You can change the variable `chromeBinary` to point to the Chrome command to use,
that is to launch Chrome via.

The `port` number used for `--remote-debugging-port=<port>`

Chrome v59 (stable) or v60 (beta) are actively tested on Ubuntu 16.04.

v60 is currently used and known to work well :+1:    

Not testing is done on canary or google-chrome-unstable so your millage may vary
if you use these versions. Windows sorry your not supported yet.

For more information see [https://developers.google.com/web/updates/2017/04/headless-chrome](Google web dev updates).

### run-crawler.sh
Once Chrome has been started you can use `run-crawler.sh`  passing it `-c <path-to-config.json>`

More information can be retrieved by using `-h` or `--help`

The `config.json` file example below is provided beside the two shell scripts without annotations as the annotations (comments) are not valid `json`

```js
{
 // supports page-only, page-same-domain, page-all-links
// crawl only the page, crawl the page and all same domain links,
// and crawl page and all links. In terms of a composite memento
  "mode": "page-same-domain",
 // an array of seeds or a single seed
  "seeds": [
    "http://www.reuters.com/"
  ],
 // currently this is the only option supported do not change.....
  "warc": {
    "naming": "url"
  },
 // Chrome instance we are to connect to is running on host, port.  
// must match --remote-debugging-port=<port> set when launching chrome.
// localhost is default host when only setting --remote-debugging-port
  "connect": {
    "host": "localhost",
    "port": 9222
  },
// time is in milliseconds
  "timeouts": {
   // wait at maxium 8s for Chrome to navigate to a page
    "navigationTimeout": 8000,
 // wait 7 seconds after page load
    "waitAfterLoad": 7000
  },
// optional auto scrolling of the page. same feature as webrecorders auto-scroll page
// time is in milliseconds and indicates the duration of the scroll
// in proportion to page size. Higher values means longer smooth scrolling, shorter values means faster smooth scroll
 "scroll": 4000
}
```
