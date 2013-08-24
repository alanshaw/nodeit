require("setimmediate")

/**
 * A noop bridge that simply logs calls to the console.
 * Can be used as a reference to what methods must be implemented by a container
 * @class bridge
 * @static
 */
module.exports = {
  /**
   * Log to the container's console
   * @method log
   */
  log: console.log,

  /**
   * Signal to the bridge that nodeit is ready
   * @method ready
   */
  ready: function () {
    this.log("Ready")
  },

  /**
   * Save a file to disk
   * @method save
   * @async
   * @param {String} path
   * @param {String} contents
   * @param {Function} cb Callback
   */
  save: function (path, contents, cb) {
    this.log("Save", path)
    setImmediate(function () {
      cb(null, path, contents)
    })
  },

  /**
   * Open a file and retrieve contents. If no path, prompt the user to choose a file to open
   * @method open
   * @async
   * @param {String} path
   * @param {Function} cb
   */
  open: function (path, cb) {
    this.log("Open", path)
    setImmediate(function () {
      cb(null, path, "Nothing to see here")
    })
  },

  /**
   * Called by nodeit when a file is closed. Return an error in the callback to cancel.
   * @method close
   * @async
   * @param {String} path
   * @param {String} contents
   * @param {Function} cb
   */
  close: function (path, contents, cb) {
    this.log("Close", path)
    setImmediate(cb)
  }
}