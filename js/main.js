var createEditor = require('javascript-editor')

var editor = createEditor({ container: document.querySelector('#editor') })
  , $editor = $("#editor")

editor.on('change', function() {
  var value = editor.getValue()
})

editor.on('valid', function(noErrors) {
  // noErrors is a boolean
})

function onResize () {
  $editor.height($(window).height())
}

$(window).resize(onResize).resize()