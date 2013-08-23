var nodeit = require("./../lib/nodeit")

window.nodeit = nodeit.create({bridge: window.nodeitBridge})

if (window.nodeitBridge) {
  // Log uncaught exceptions to the bridge if available
  window.onerror = function (msg, url, line) {
    nodeitBridge.log(msg + "' from " + url + ":" + line)
    return true
  }
}