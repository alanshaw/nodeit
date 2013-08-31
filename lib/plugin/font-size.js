var events = require("events")
  , inherits = require("inherits")

/**
 * @class FontSizePlugin
 * @constructor
 * @param {Nodeit} nodeit
 */
function FontSizePlugin (nodeit) {
  this.nodeit = nodeit
  
  // TODO: This should be passed as config option
  this.dflt = parseInt(this.getEditorEl().css("font-size"), 10)
  this.current = this.dflt
  this.sizes = {} // Current font sizes keyed by doc ID
  
  nodeit.on("docOpen", this.onDocOpen.bind(this))
  nodeit.on("docNew", this.onDocNew.bind(this))
  nodeit.on("docSwap", this.onDocSwap.bind(this))
  
  nodeit.log("Default font size", this.dflt, "px")
}

inherits(FontSizePlugin, events.EventEmitter)

/**
 * Change the font size of the current document
 * @method changeSize
 * @param {int} size New font size in px
 */
FontSizePlugin.prototype.changeSize = function (size) {
  size = size < 8 ? 8 : size
  
  if (this.current == size) return;
  
  var last = this.current
    , doc = this.nodeit.getEditor().getDoc()
  
  this.sizes[doc.id] = this.current = size
  
  this.nodeit.log("Changing font size to", size)
  
  this.getEditorEl().css("font-size", size)
  this.nodeit.getEditor().refresh()
  
  this.emit("change", size, last)
}

/**
 * Increase font size of current document
 * @method increase
 */
FontSizePlugin.prototype.increase = function () {
  this.changeSize(this.current + 2)
}

/**
 * Decrease font size of current document
 * @method decrease
 */
FontSizePlugin.prototype.decrease = function () {
  this.changeSize(this.current - 2)
}

/**
 * Reset font size of current document
 * @method reset
 */
FontSizePlugin.prototype.reset = function () {
  this.changeSize(this.dflt)
}

/**
 * @private
 */
FontSizePlugin.prototype.getEditorEl = function () {
  return $(this.nodeit.getEditor().getWrapperElement())
}

/**
 * @private
 */
FontSizePlugin.prototype.onDocOpen = function () {
  this.changeSize(this.dflt)
}

/**
 * @private
 */
FontSizePlugin.prototype.onDocNew = function () {
  this.changeSize(this.dflt)
}

/**
 * @private
 */
FontSizePlugin.prototype.onDocSwap = function (doc) {
  this.changeSize(this.sizes[doc.id])
}

/**
 * @class font-size
 * @static
 */
module.exports = {
  /**
   * Create and return a new FontSizePlugin instance
   * @method create
   * @param {Nodeit} nodeit
   * @param {Function} cb
   */
  create: function (nodeit, cb) {
    var plugin = new FontSizePlugin(nodeit)
    cb(null, plugin)
  }
}