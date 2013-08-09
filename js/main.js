var events = require("events")
  , inherits = require("inherits")
  , cmUtil = require("./util/codemirror")

require("codemirror")

window.nodeit = window.nodeit || {}

function Container () {}

inherits(Container, events.EventEmitter)

nodeit.ct = new Container()

function pathToTitle (path) {
  if (!path) {
    return "untitled"
  }
  var parts = path.split("/")
  return parts[parts.length - 1]
}

nodeit.ct.on("open", function (path, contents) {
  console.log("Open file", path)
  
  cmUtil.loadMode(path, function (er, mode) {
    if (er) return console.error("Failed to load mode for", path)
    
    var doc = CodeMirror.Doc(contents, mode, 0)
    
    chromeTabs.addNewTab(tabsEl, {
      title: pathToTitle(path),
      value: contents,
      data: {
        docId: doc.id,
        path: path
      }
    })
    
    docs.push(doc)
    editor.swapDoc(doc)
  })
})

var tabsEl = $("#tabs")
  , editorEl = $("#editor")
  , editor = CodeMirror(editorEl[0], {
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

var docs = [editor.getDoc()]

function findDocById (id) {
  for (var i = 0, len = docs.length; i < len; ++i) {
    if (docs[i].id == id) {
      return docs[i]
    }
  }
  return null
}

chromeTabs.init({
  $shell: tabsEl,
  minWidth: 45,
  maxWidth: 160
})

chromeTabs.addNewTab(tabsEl, {
  //favicon: 'img/icon-doc.svg',
  title: 'untitled',
  data: {
    docId: docs[0].id
  }
})

tabsEl.bind('chromeTabRender', function () {
  var tab = tabsEl.find('.chrome-tab-current')
    , data = tab.data('tabData').data
  
  if (tab.length && window['console'] && console.log) {
    console.log('Current tab index', tab.index(), 'title', $.trim(tab.text()), 'data', data)
    var doc = findDocById(data.docId)
    if (doc && doc != editor.getDoc()) {
      editor.swapDoc(doc)
    }
  }
})

function onResize () {
  editorEl.height($(window).height() - tabsEl.outerHeight())
}

$(window).resize(onResize).resize()


// TEST

$(function () {
  nodeit.ct.emit("open", "foo.js", "")
})