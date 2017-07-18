# WIP

Iv [origin-stamped](https://app.originstamp.org/home) this :feelsgood:

Remember Open Source and Comunity Envolvement!

# Usage 

There are two `.sh` scripts in the 
run-chrome.sh you can change the variable `chromeBinary` to point to the Chrome command to use and the port number used for `--remote-debugging-port=`
Chrome v59 (stable) or v60 (beta) tested by myself Ubuntu 16.04, currently use v60 :+1:    
@maturban reports he found that only v60 and Canary on his OSX machine, so your mileage may vary even though the headless mode is now stable i.e in google-chrome-stable v59.
I can report that headless and no-headless mode works for v59 and v60 on Ubuntu 16.04. I do not test on canary nor google-chrome-unstable.  

```shell
#!/usr/bin/env bash

remoteDebugPort=9222
chromeBinary="google-chrome-beta"


if [ "$1" = "headless" ]; then
   $chromeBinary --headless --disable-gpu --remote-debugging-port=9222
else
   $chromeBinary --remote-debugging-port=9222
```

for more information see [https://developers.google.com/web/updates/2017/04/headless-chrome](Google web dev updates).

Once Chrome has been started you can use `run-crawler.sh`  passing it `-c <path-to-config.json>`
```sh
#!/usr/bin/env bash

node --harmony index.js "$@"
```
more information can be retrieved by using `-h` or `--help`

The config.json file looks like so (with annotations)
```js
{
 // supports page-only, page-same-domain, page-all-links 
// (crawl only the page, crawl the page and all same domain links and crawl page and all links. In terms of a composite memento)
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

