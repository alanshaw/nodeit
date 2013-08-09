// Get a CodeMirror mode from a file path
module.exports.getMode = function (path) {
  if (!path) {
    return null
  }
  
  var ext = path.slice(path.lastIndexOf(".") + 1)
  
  if (ext == "js") {
    return "javascript"
  }
  
  return null
}

var loadedModes = []

// Load a CodeMirror mode from a file path (if not already loaded)
module.exports.loadMode = function (path, cb) {
  var mode = module.exports.getMode(path)
  
  if (!mode || loadedModes.indexOf(mode) != -1) {
    return cb(null, mode)
  }
  
  console.log("Load mode", mode)
  
  var src = "node_modules/codemirror/mode/" + mode + "/" + mode + ".js"
  
  $("<script/>").load(function () {
    loadedModes.push(mode)
    cb(null, mode)
  }).appendTo(document.body).attr("src", src)
}