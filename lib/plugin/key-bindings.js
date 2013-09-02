/**
 * Default key bindings for nodeit
 */ 
module.exports = {
  create: function (nodeit, cb) {
    
    var input = nodeit.editor.getInputField()
    
    $(input).bind("keydown.meta_n keydown.ctrl_n", function (e) {
      e.preventDefault()
      nodeit.log("key-binding new")
      nodeit.neu()
    })
    
    $(input).bind("keydown.meta_w keydown.ctrl_w", function (e) {
      e.preventDefault()
      nodeit.log("key-binding close")
      nodeit.close()
    })
    
    $(input).bind("keydown.meta_s keydown.ctrl_s", function (e) {
      e.preventDefault()
      nodeit.log("key-binding save")
      nodeit.save()
    })
    
    cb()
  }
}