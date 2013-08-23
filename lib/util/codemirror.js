require("setimmediate")
var async = require("async")

// Get a CodeMirror mode from a file path
function pathToMode (path) {
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
module.exports.pathToMode = pathToMode

var loadedModes = []

// Load a CodeMirror mode
function loadMode (mode, cb) {
  console.log("Load mode", mode)
  
  if (!mode || loadedModes.indexOf(mode) != -1) {
    return setImmediate(function () {
      cb(null, mode)
    })
  }
  
  var src = "node_modules/codemirror/mode/" + mode + "/" + mode + ".js"
  
  loadedModes.push(mode)
  
  $("<script/>").load(function () {
    var deps = CodeMirror.modes[mode].dependencies
    
    // Deps are undefined if none, not empty array, thanks CodeMirror
    if (!deps || !deps.length) return cb(null, mode)
    
    // Load mode dependencies
    var loadTasks = deps.map(function (depMode) {
      return function (cb) {
        loadMode(depMode, function (er, mode) {
          cb(er, mode)
        })
      }
    })
    
    async.parallel(loadTasks, cb)
    
  }).appendTo(document.body).attr("src", src)
}
module.exports.loadMode = loadMode