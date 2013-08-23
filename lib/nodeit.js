// TODO: ChromeTabs needs to become a module

var events = require("events")
  , inherits = require("inherits")
  , cmUtil = require("./util/codemirror")
  , bridge = require("./bridge")
  , async = require("async")

require("setimmediate")
require("codemirror")

/**
 * @class Nodeit
 * @constructor
 * @param {Object} [opts]
 */
function Nodeit (opts) {
  this.opts = opts || {}
  this.bridge = this.opts.bridge || bridge
  
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
    this.bridge.ready()
  }.bind(this))
  
  this.log("nodeit ready")
}

/**
 * When a new document is opened
 * @event docNew
 * @param {CodeMirror.Doc} doc
 */
/**
 * When a document is opened
 * @event docOpen
 * @param {CodeMirror.Doc} doc
 */
/**
 * When a document is saved to disk, or whatever
 * @event docSave
 * @param {CodeMirror.Doc} doc
 */
/**
 * When a document is closed
 * @event docClose
 * @param {CodeMirror.Doc} doc
 */
/**
 * When the current document is swapped for another
 * @event docSwap
 * @param {CodeMirror.Doc} doc The newly current document
 * @param {CodeMirror.Doc} prev The previously current document
 */
inherits(Nodeit, events.EventEmitter)

/**
 * Set the nodeit bridge object
 * @method setBridge
 * @param bridge
 */
Nodeit.prototype.setBridge = function (bridge) {
  this.bridge = bridge
}

Nodeit.prototype.log = function () {
  this.bridge.log(Array.prototype.slice.call(arguments).join(" "))
}

/**
 * Get the number of open docs
 * @method count
 * @returns {int}
 */
Nodeit.prototype.count = function () {
  return this.docs.length
}

/**
 * Create a new file
 * @method neu
 * @async
 * @param {Function} [cb]
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
 * @method open
 * @async
 * @param {String} [path] Path to file. If no path, prompt the user to choose a file to open
 * @param {Function} [cb] Callback
 */
Nodeit.prototype.open = function (path, cb) {
  this.log("Open file", path)
  
  cb = cb || function (er) {
    if (er) this.log(er)
  }.bind(this)
  
  // Don't open if already open, switch to open doc tab
  if (path) {
    var doc = this.findDocByPath(path)
    
    if (doc) {
      chromeTabs.setCurrentTab(this.tabsEl, this.findTabByDoc(doc))
      return cb(null, doc)
    }
  }
  
  this.bridge.open(path, function (er, path, contents) {
    if (er) return cb(er)
    
    cmUtil.loadMode(cmUtil.pathToMode(path), function (er, mode) {
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
 * Save the passed document to disk, or whatever. If no document passed, default to current document.
 * @method save
 * @async
 * @param {CodeMirror.Doc} [doc] Document to save
 * @param {Function} [cb] Callback
 */
Nodeit.prototype.save = function (doc, cb) {
  
  cb = cb || function (er) {
    if (er) this.log(er)
  }.bind(this)
  
  doc = doc || this.editor.getDoc()
  
  this.log("Save doc", doc.id)
  
  if (doc.nodeit.saved) {
    return cb(new Error("Already saved"))
  }
  
  this.bridge.save(doc.nodeit.path, doc.getValue(), function (er, path) {
    if (er) return cb(er)
    
    this.log("Bridge save called back")
    
    doc.nodeit.path = path
    doc.nodeit.saved = true
    
    // Update tab title
    var tab = this.findTabByDoc(doc)
    
    // TODO: Tab might not exist anymore if called because of a close
    // this is because chromeTabs doesn't ask whether a tab should close or not
    if (tab) {
      tab.removeClass("unsaved").find(".chrome-tab-title").text(Nodeit.pathToTitle(path))
    }
    
    // Update mode
    cmUtil.loadMode(cmUtil.pathToMode(path), function (er, mode) {
      this.editor.setOption("mode", mode)
    }.bind(this))
    
    cb(null, doc)
    
    this.emit("docSave", doc)
  }.bind(this))
}

/**
 * Close the passed document, prompting for save if changed. If no document passed, default to current document.
 * @method close
 * @async
 * @param {CodeMirror.Doc} [doc] Document to close
 * @param {Function} [cb] Callback
 */
Nodeit.prototype.close  = function (doc, cb) {
  
  cb = cb || function (er) {
    if (er) this.log(er)
  }.bind(this)
  
  doc = doc || this.editor.getDoc()
  
  this.log("Close doc", doc.id)
  
  async.series([
    // Prompt save doc if not saved
    function (cb) {
      if (doc.nodeit.saved) return cb()
      if (doc.nodeit.path == "" && doc.getValue() == "") return cb()
      if (!confirm("Save changes to " + Nodeit.pathToTitle(doc.nodeit.path) + "?")) return cb()
      this.save(doc, cb)
    }.bind(this),
    
    // Close doc via bridge
    function (cb) {
      this.log(doc.nodeit.saved ? "Closing saved doc" : "Closing doc with unsaved changes")
      
      this.bridge.close(doc.nodeit.path, doc.getValue(), function (er) {
        if (er) return cb(er)
        
        this.log("Bridge close called back")
        
        this.docs = this.docs.reduce(function (docs, d) {
          if (d !== doc) docs.push(d)
          return docs
        }, [])
        
        var tab = this.findTabByDoc(doc)
        
        // chromeTabs might have already closed the tab if user clicked the x
        if (tab) {
          chromeTabs.closeTab(this.tabsEl, tab)
        }
        
        // Remove orphan doc from editor
        if (!this.docs.length) {
          this.editor.swapDoc(CodeMirror.Doc("", null, 0))
        }
        
        cb(null, doc)
        this.emit("docClose", doc)
        
      }.bind(this))
    }.bind(this)
  ], cb)
}

/**
 * Close all open documents
 * @method closeAll
 * @async
 * @param {Function} [cb]
 */
Nodeit.prototype.closeAll  = function (cb) {
  
  cb = cb || function (er) {
    if (er) this.log(er)
  }.bind(this)
  
  this.log("Close all")
  
  var closeTasks = this.docs.map(function (doc) {
    this.log("Creating close task for", doc.id)
    return function (cb) {
      this.close(doc, cb)
    }.bind(this)
  }, this)
  
  async.series(closeTasks, cb)
}

/**
 * Find an open CodeMirror document by ID
 * @method findDocById
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
 * Find an open CodeMirror document by path
 * @method findDocByPath
 * @param {String} path
 * @returns {CodeMirror.Doc}
 */
Nodeit.prototype.findDocByPath = function (path) {
  for (var i = 0, len = this.docs.length; i < len; ++i) {
    if (this.docs[i].nodeit.path == path) {
      return this.docs[i]
    }
  }
  return null
}

/**
 * Given a document, find it's tab
 * @method findTabByDoc
 * @param {CodeMirror.Doc} doc
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
 * @method onTabChange
 * @private
 */
Nodeit.prototype.onTabChange = function () {
  var tab = this.tabsEl.find(".chrome-tab-current")
    , closedDoc = null
  
  // Did a tab get closed?
  this.docs.some(function (doc) {
    if (!this.findTabByDoc(doc)) {
      closedDoc = doc
      return true
    }
    return false
  }, this)
  
  // Deal with fallout from closed tab
  if (closedDoc) {
    this.log("Tab closed")
    
    // Close the doc that belongs to this tab
    this.close(closedDoc, function (er) {
      if (er) return this.log("Failed to close doc " + closedDoc.id, er)
    }.bind(this))
  }
  
  if (!tab.length) {
    return // No tabs open yet
  }
  
  var data = tab.data("tabData").data
    , doc = this.findDocById(data.docId)
    , prev = this.editor.getDoc()

  if (doc && doc != prev) {
    this.log("Doc swap", prev.id, " -> ", doc.id)
    this.editor.swapDoc(doc)
    this.emit("docSwap", doc, prev)
  }
}

/**
 * @method onDocChange
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
 * @method pathToTitle
 * @satic
 * @param {String} path
 * @returns {String}
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

/**
 * @class nodeit (module)
 * @static
 */
module.exports = {
  /**
   * Create and return a new Nodeit instance
   * @method create
   * @param [opts]
   * @returns {Nodeit}
   */
  create: function (opts) {
    return new Nodeit(opts)
  }
}

