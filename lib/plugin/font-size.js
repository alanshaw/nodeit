var events = require("events")
  , inherits = require("inherits")

function FontSizePlugin (nodeit) {
  this.nodeit = nodeit
  this.initial = parseInt(this.getEditorEl().css("font-size"), 10)
  this.current = this.initial
  nodeit.log("Initial font size", this.current, "px")
}

inherits(FontSizePlugin, events.EventEmitter)

FontSizePlugin.prototype.changeSize = function (size) {
  size = size < 8 ? 8 : size
  
  if (this.current == size) return;
  
  var last = this.current
  this.current = size
  
  this.nodeit.log("Changing font size to", size)
  
  this.getEditorEl().css("font-size", size)
  this.nodeit.getEditor().refresh()
  
  this.emit("change", size, last)
}

FontSizePlugin.prototype.increase = function () {
  this.changeSize(this.current + 2)
}

FontSizePlugin.prototype.decrease = function () {
  this.changeSize(this.current - 2)
}

FontSizePlugin.prototype.reset = function () {
  this.changeSize(this.initial)
}

FontSizePlugin.prototype.getEditorEl = function () {
  return $(this.nodeit.getEditor().getWrapperElement())
}

module.exports = {
  create: function (nodeit, cb) {
    var plugin = new FontSizePlugin(nodeit)
    cb(null, plugin)
  }
}