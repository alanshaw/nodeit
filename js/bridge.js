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
    console.log("Save", path)
    setImmediate(function () {
      cb(null, path, contents)
    })
  }
}