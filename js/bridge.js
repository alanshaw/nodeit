/**
 * A noop bridge that simply logs calls to the console.
 * Can be used as a reference to what methids must be implemented by a container
 */
module.exports = {
  /**
   * Log to the container's console
   */
  log: console.log,

  /**
   * Files to open on startup?
   */
  startupFiles: []
}