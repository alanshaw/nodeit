// Get a CodeMirror mode from a file path
nodeit.cm.getMode = function (path) {
  if (!path) {
    return null
  }
  
  var ext = path.slice(path.lastIndexOf(".") + 1)
  
  // TODO: Implement
  return "javascript"
}

var loadedModes = []

// Load a CodeMirror mode from a file path (if not already loaded)
nodeit.cm.loadMode = function (path, cb) {
  var mode = nodeit.cm.getMode(path)
  
  if (!mode || loadedModes.indexOf(mode) != -1) {
    return cb()
  }
  
  var src = "node_modules/codemirror/mode/" + mode + "/" + mode + ".js"
  
  $("<script/>").load(cb).attr("src", src).appendTo(document.body)
}