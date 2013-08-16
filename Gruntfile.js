module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    browserify: {
      dist: {
        files: {
          "js/bundle.js": "js/main.js"
        }
      }
    },
    watch: {
      js: {
        files: ["{js,lib}/**/*.js", "!js/bundle.js"],
        tasks: ["browserify"]
      }
    }
  })

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks("grunt-browserify")
  grunt.loadNpmTasks("grunt-contrib-watch")

  // Default task(s).
  grunt.registerTask("default", ["browserify"])
}