var events = require("events")
  , inherits = require("inherits")
  , cmUtil = require("./util/codemirror")
  , bridge = require("./bridge")

require("setimmediate")
require("codemirror")

function Nodeit (bridge, opts) {
  this.bridge = bridge
  this.opts = opts || {}
  
  this.tabsEl = $(this.opts.tabsEl || "#tabs")
  this.editorEl = $(this.opts.editorEl || "#editor")
  this.editor = CodeMirror(this.editorEl[0], {
      lineNumbers: true,
      autofocus: true,
      matchBrackets: true,
      indentWithTabs: false,
      smartIndent: true,
      tabSize: 2,
      indentUnit: 2,
      updateInterval: 500,
      dragAndDrop: true
    })
  
  this.docs = [this.editor.getDoc()]
  
  chromeTabs.init({
    $shell: this.tabsEl,
    minWidth: 45,
    maxWidth: 160
  })
  
  chromeTabs.addNewTab(this.tabsEl, {
    title: "untitled",
    data: {docId: this.docs[0].id}
  })
  
  this.tabsEl.bind("chromeTabRender", this.onTabChange.bind(this))
  
  this.on("open", this.onOpen.bind(this))
  
  $(window).resize(this.onWindowResize.bind(this)).resize()
  
  setImmediate(function () { this.emit("ready") }.bind(this))
}

inherits(Nodeit, events.EventEmitter)

/**
 * Find a CodeMirror document by ID
 * @param id
 * @returns {CodeMirror.Doc}
 */
Nodeit.prototype.findDocById = function (id) {
  for (var i = 0, len = this.docs.length; i < len; ++i) {
    if (this.docs[i].id == id) {
      return this.docs[i]
    }
  }
  return null
}

/**
 * On file open handler
 * @private
 */
Nodeit.prototype.onOpen = function (path, contents) {
  console.log("Open file", path)
  
  cmUtil.loadMode(path, function (er, mode) {
    if (er) return console.error("Failed to load mode for", path)
    
    var doc = CodeMirror.Doc(contents, mode, 0)
    
    chromeTabs.addNewTab(this.tabsEl, {
      //favicon: 'img/icon-doc.svg',
      title: Nodeit.pathToTitle(path),
      value: contents,
      data: {
        docId: doc.id,
        path: path
      }
    })
    
    this.docs.push(doc)
    this.editor.swapDoc(doc)
    
  }.bind(this))
}

/**
 * On tab change handler
 * @private
 */
Nodeit.prototype.onTabChange = function () {
  var tab = this.tabsEl.find('.chrome-tab-current')
    , data = tab.data('tabData').data
  
  if (tab.length && window['console'] && console.log) {
    console.log('Current tab index', tab.index(), 'title', $.trim(tab.text()), 'data', data)
    var doc = this.findDocById(data.docId)
    if (doc && doc != this.editor.getDoc()) {
      this.editor.swapDoc(doc)
    }
  }
}

/**
 * On window resize handler
 * @private
 */
Nodeit.prototype.onWindowResize = function () {
  this.editorEl.height($(window).height() - this.tabsEl.outerHeight())
}

/**
 * Convert a file path to a tab title
 * @satic
 * @param path
 * @returns {*}
 */
Nodeit.pathToTitle = function (path) {
  if (!path) {
    return "untitled"
  }
  var parts = path.split("/")
  return parts[parts.length - 1]
}

window.nodeit = new Nodeit(window.nodeitBridge || bridge)

// TEST

$(function () {
  nodeit.emit("open", "foo.js", "")
})

setTimeout(function () {
  nodeitBridge.log("LOG FROM NODEIT")
}, 2000)