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
      lineWrapping: true,
      autofocus: true,
      matchBrackets: true,
      indentWithTabs: false,
      smartIndent: true,
      tabSize: 2,
      indentUnit: 2,
      updateInterval: 500,
      dragAndDrop: true
    })
  this.docs = []
  
  chromeTabs.init({
    $shell: this.tabsEl,
    minWidth: 45,
    maxWidth: 160
  })
  
  this.tabsEl.bind("chromeTabRender", this.onTabChange.bind(this))
  
  $(window).resize(this.onWindowResize.bind(this)).resize()
  
  setImmediate(function () {
    this.emit("ready")
    bridge.ready()
  }.bind(this))
  
  this.log("nodeit ready")
}

inherits(Nodeit, events.EventEmitter)

/**
 * Set the nodeit bridge object
 * @param bridge
 */
Nodeit.prototype.setBridge = function (bridge) {
  this.bridge = bridge
}

Nodeit.prototype.log = function () {
  this.bridge.log(Array.prototype.slice.call(arguments).join(" "))
}

/**
 * Create a new file
 * @param cb
 */
Nodeit.prototype.neu = function (cb) {
  this.log("New file")
  
  cb = cb || function (er) {
    if (er) this.log(er)
  }.bind(this)
  
  var doc = CodeMirror.Doc("", null, 0)
  
  // Store some nodeit data on the document
  doc.nodeit = {
    path: "",
    saved: false
  }
  
  doc.on("change", this.onDocChange.bind(this))
  
  chromeTabs.addNewTab(this.tabsEl, {
    title: "untitled",
    data: {docId: doc.id}
  })
  
  this.docs.push(doc)
  this.editor.swapDoc(doc)
  
  cb(null, doc)
  
  this.emit("docNew", doc)
}

/**
 * Open a file
 * @param {String} path Path to file. If no path, prompt the user to choose a file to open
 * @param {Function} cb Callback
 */
Nodeit.prototype.open = function (path, cb) {
  this.log("Open file", path)
  
  cb = cb || function (er) {
    if (er) this.log(er)
  }.bind(this)
  
  // TODO: Don't open if already open, switch to open doc tab
  
  this.bridge.open(path, function (er, path, contents) {
    if (er) return cb(er)
    
    cmUtil.loadMode(path, function (er, mode) {
      if (er) return cb(er)
      
      var doc = CodeMirror.Doc(contents, mode, 0)
      
      // Store some nodeit data on the document
      doc.nodeit = {
        path: path,
        saved: true
      }
      
      doc.on("change", this.onDocChange.bind(this))
      
      chromeTabs.addNewTab(this.tabsEl, {
        //favicon: 'img/icon-doc.svg',
        title: Nodeit.pathToTitle(path),
        value: contents,
        data: {docId: doc.id}
      })
      
      this.docs.push(doc)
      this.editor.swapDoc(doc)
      
      cb(null, doc)
      
      this.emit("docOpen", doc)
      
    }.bind(this))
  }.bind(this))
}

/**
 * Save the current document to disk, or whatever.
 */
Nodeit.prototype.save = function () {
  var doc = this.editor.getDoc()
  
  this.log("Save doc", doc.id)
  
  if (doc.nodeit.saved) {
    return this.log("Already saved")
  }
  
  this.bridge.save(doc.nodeit.path, doc.getValue(), function (er, path) {
    if (er) return this.log(er)
    
    doc.nodeit.path = path
    doc.nodeit.saved = true
    
    // Update tab title
    this.findTabByDoc(doc)
      .removeClass("unsaved")
      .find(".chrome-tab-title") // TODO: use chromeTab.updateTab
      .text(Nodeit.pathToTitle(path))
    
    // Update mode
    cmUtil.loadMode(path, function (er, mode) {
      this.editor.setOption("mode", mode)
    }.bind(this))
    
    this.emit("docSave", doc)
  }.bind(this))
}

/**
 * Find an open CodeMirror document by ID
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
 * Given a document, find it's tab
 * @param doc
 * @returns {jQuery}
 */
Nodeit.prototype.findTabByDoc = function (doc) {
  var tabs = this.tabsEl.find(".chrome-tab")
  
  for (var i = 0, len = tabs.length; i < len; ++i) {
    var tab = $(tabs[i])
    
    if (tab.data("tabData").data.docId == doc.id) {
      return tab
    }
  }
  return null
}

/**
 * @private
 */
Nodeit.prototype.onTabChange = function () {
  var tab = this.tabsEl.find(".chrome-tab-current")
  
  if (!tab.length) {
    return // No tabs open yet
  }
  
  // Did a doc get removed?
  this.docs = this.docs.reduce(function (docs, doc) {
    
    if (!this.findTabByDoc(doc)) {
      
      // TODO: Deal with unsaved changes
      this.log("Close doc", doc.id)
      this.emit("docClose", doc)
      
    } else {
      docs.push(doc)
    }
    
    return docs
    
  }.bind(this), [])
  
  var data = tab.data("tabData").data

  var doc = this.findDocById(data.docId)
    , prev = this.editor.getDoc()

  if (doc && doc != prev) {
    this.log("Doc swap", prev.id, " -> ", doc.id)
    this.editor.swapDoc(doc)
    this.emit("docSwap", doc, prev)
  }
}

/**
 * @private
 * @param doc
 */
Nodeit.prototype.onDocChange = function (doc) { 
  doc.nodeit.saved = false
  this.findTabByDoc(doc).addClass("unsaved")
}

/**
 * @private
 */
Nodeit.prototype.onWindowResize = function () {
  this.editorEl.height($(window).height() - this.tabsEl.outerHeight())
}

/**
 * Convert a file path to a human readable title suitable for showing on a tab, for instance
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

/* chrome-tabs tweaks */

// Disable dblclick event
!function () {
  var setupEvents = chromeTabs.setupEvents
  chromeTabs.setupEvents = function ($shell) {
    var $tabs = setupEvents.call(chromeTabs, $shell)
    $shell.unbind('dblclick')
    return $tabs
  }
}()

window.nodeit = new Nodeit(window.nodeitBridge || bridge)

