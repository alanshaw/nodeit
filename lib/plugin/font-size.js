function FontSizePlugin (nodeit) {
  this.nodeit = nodeit
  this.initial = parseInt(this.getEditorEl().css("font-size"), 10)
  this.current = this.initial
  console.log("Initial font size", this.current, "px")
}

FontSizePlugin.prototype.increase = function () {
  this.current++
  this.getEditorEl().css("font-size", this.current)
}

FontSizePlugin.prototype.decrease = function () {
  this.current--
  this.getEditorEl().css("font-size", this.current)
}

FontSizePlugin.prototype.reset = function () {
  this.current = this.initial
  this.getEditorEl().css("font-size", this.current)
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