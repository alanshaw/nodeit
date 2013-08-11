require("setimmediate")

/**
 * A noop bridge that simply logs calls to the console.
 * Can be used as a reference to what methods must be implemented by a container
 */
module.exports = {
  /**
   * Log to the container's console
   */
  log: console.log,

  /**
   * Files to open on startup?
   */
  startupFiles: [],

  /**
   * Save a file to disk
   * @param path
   * @param contents
   * @param cb Callback
   */
  save: function (path, contents, cb) {
    this.log("Save", path)
    setImmediate(function () {
      cb(null, path, contents)
    })
  },

  /**
   * Open a file and retrieve contents. If no path, prompt the user to choose a file to open
   * @param path
   * @param cb
   */
  open: function (path, cb) {
    this.log("Open", path)
    setImmediate(function () {
      cb(null, "/path/to/file.js", "// Nothing to see here")
    })
  }
}