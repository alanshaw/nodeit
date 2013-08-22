require("setimmediate")

// Get a CodeMirror mode from a file path
module.exports.getMode = function (path) {
  if (!path) {
    return null
  }
  
  var ext = path.slice(path.lastIndexOf(".") + 1)
  
  switch (ext) {
    case "coffee": return "coffee"
    case "css": return "css"
    case "html": return "htmlmixed"
    case "js":
    case "json": return "javascript"
    case "less": return "less"
    case "php": return "php"
    case "markdown":
    case "md": return "markdown"
    case "sass": return "sass"
    case "xhtml": return "htmlmixed"
    case "xml": return "xml" 
  }
  
  return null
}

var loadedModes = []

// Load a CodeMirror mode from a file path (if not already loaded)
module.exports.loadMode = function (path, cb) {
  setImmediate(function () {
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
  })
}