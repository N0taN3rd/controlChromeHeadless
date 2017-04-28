const CDP = require('chrome-remote-interface')

async function testDom (Dom,client) {
  let flat = await Dom.getFlattenedDocument({depth: -1,pierce: true})
  console.log(flat)
  client.close();
}
CDP((client) => {
  // extract domains
  const {Network, Page,DOM} = client;
  // setup handlers
  Network.requestWillBeSent((params) => {
    console.log(params.request.url);
  });
  Page.loadEventFired(() => {
    // client.close();
    testDom(DOM,client).then(() => {
      console.log('done')
    }).catch(err => {
      console.error(err)
      client.close();
    })
  });
  // enable events then start!
  Promise.all([
    Network.enable(),
    Page.enable(),
    DOM.enable(),
  ]).then(() => {
    return Page.navigate({url: 'https://github.com'});
  }).catch((err) => {
    console.error(err);
    client.close();
  });
}).on('error', (err) => {
  // cannot connect to the remote endpoint
  console.error(err);
});