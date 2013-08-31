function FontSizePlugin (nodeit) {
  this.nodeit = nodeit
  this.initial = parseInt(this.getEditorEl().css("font-size"), 10)
  this.current = this.initial
  nodeit.log("Initial font size", this.current, "px")
}

FontSizePlugin.prototype.applySize = function (size) {
  this.current = size
  this.nodeit.log("Changing font size to", size)
  this.getEditorEl().css("font-size", size)
  this.nodeit.getEditor().refresh()
}

FontSizePlugin.prototype.increase = function () {
  this.applySize(this.current + 1)
}

FontSizePlugin.prototype.decrease = function () {
  this.applySize(this.current - 1)
}

FontSizePlugin.prototype.reset = function () {
  this.applySize(this.initial)
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