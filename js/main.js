var createEditor = require('javascript-editor')

var editor = createEditor({ container: document.querySelector('#editor') })
  , $tabs = $("#tabs")
  , $editor = $("#editor")

editor.on('change', function() {
  var value = editor.getValue()
})

editor.on('valid', function(noErrors) {
  // noErrors is a boolean
})

var $chromeTabsExampleShell = $tabs

chromeTabs.init({
  $shell: $chromeTabsExampleShell,
  minWidth: 45,
  maxWidth: 180
});

chromeTabs.addNewTab($chromeTabsExampleShell, {
  //favicon: 'img/icon-doc.svg',
  title: 'untitled',
  data: {
    timeAdded: +new Date()
  }
})

$chromeTabsExampleShell.bind('chromeTabRender', function(){
  var $currentTab = $chromeTabsExampleShell.find('.chrome-tab-current');
  if ($currentTab.length && window['console'] && console.log) {
    console.log('Current tab index', $currentTab.index(), 'title', $.trim($currentTab.text()), 'data', $currentTab.data('tabData').data);
  }
})


function onResize () {
  $editor.height($(window).height() - $tabs.outerHeight())
}

$(window).resize(onResize).resize()